"""Import the supplied building inventory and matching public EstateLion facts.

Uses Python's standard library and the project's existing sharp dependency.
Raw source pages stay in a temporary cache; only property facts are committed.
"""
import argparse
import concurrent.futures
import datetime
import html
import json
import re
import subprocess
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://estatelion.com/"
CHECKED_AT = datetime.datetime.now(datetime.timezone.utc).astimezone(
    datetime.timezone(datetime.timedelta(hours=5, minutes=30))).date().isoformat()
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def normalise(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def read_sheet(file):
    with zipfile.ZipFile(file) as archive:
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ["".join(node.text or "" for node in item.findall(".//s:t", NS))
                      for item in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
        rows = ET.fromstring(archive.read("xl/worksheets/sheet1.xml")).findall(".//s:sheetData/s:row", NS)
        result = []
        for row in rows[1:]:
            cells = {}
            for cell in row.findall("s:c", NS):
                column = re.sub(r"\d", "", cell.get("r", ""))
                value = cell.find("s:v", NS)
                if cell.get("t") == "inlineStr":
                    cells[column] = "".join(item.text or "" for item in cell.findall(".//s:t", NS)).strip()
                elif value is not None:
                    cells[column] = (shared[int(value.text)] if cell.get("t") == "s" else value.text).strip()
            if cells.get("A") and cells.get("B"):
                sector = re.sub(r"^sector\s*", "", cells["B"], flags=re.I)
                if normalise(sector) in ["flimcity", "filmcity"]:
                    sector = "Film City"
                result.append({"sheetRow": int(row.get("r")), "name": cells["A"], "sector": sector})
        if not result:
            raise ValueError("The building workbook contains no inventory rows.")
        return result


def flight_records(page):
    chunks = []
    for match in re.finditer(r"self\.__next_f\.push\((\[.*?\])\)</script>", page):
        value = json.loads(match[1])
        if len(value) > 1 and isinstance(value[1], str):
            chunks.append(value[1])
    stream = "".join(chunks)
    records = {}
    decoder = json.JSONDecoder()
    for match in re.finditer(r"([a-f0-9]+):(?=[\[{])", stream):
        try:
            records[match[1]] = decoder.raw_decode(stream[match.end():])[0]
        except ValueError:
            pass
    raw = stream.encode("utf-8")
    for match in re.finditer(rb"([a-f0-9]+):T([a-f0-9]+),", raw):
        records[match[1].decode()] = raw[match.end():match.end() + int(match[2], 16)].decode("utf-8")
    return records


def walk(value):
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)


def download(url):
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            return urllib.request.urlopen(request, timeout=35).read().decode()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


PROPERTY_FIELDS = ["title", "seoURL", "address", "landmark", "locality", "city", "propertyType",
                   "propertyCategory", "price", "totalFloors", "amenities", "facing", "airconditioningType",
                   "builtYear", "certification", "typicalFloor", "builtUpArea", "builtUpAreaUnit",
                   "parkingRatio", "builtFloorsInfo", "nearestMetro", "nearestAirport", "minArea",
                   "maxArea", "unitsAvailable", "availableUnits", "images", "floorPlans", "developer",
                   "locationDetails", "description", "quickFacts", "rentalRangePerSqft", "updatedAt"]


def building_details(source_slug, cache):
    file = cache / (source_slug + ".json")
    if file.exists():
        return json.loads(file.read_text())
    records = flight_records(download(BASE_URL + source_slug))
    building = next((item for record in records.values() for item in walk(record)
                     if isinstance(item, dict) and item.get("seoURL") == source_slug
                     and item.get("propertyCategory") == "CommercialBuilding" and "amenities" in item), None)
    if not building:
        raise ValueError("No public building record: " + source_slug)

    def resolve(value):
        if isinstance(value, str) and re.fullmatch(r"\$[a-f0-9]+", value):
            return resolve(records.get(value[1:], value))
        if isinstance(value, list):
            return [resolve(item) for item in value]
        if isinstance(value, dict):
            return {key: resolve(item) for key, item in value.items()}
        return value

    result = {key: resolve(building[key]) for key in PROPERTY_FIELDS if key in building}
    result["sourceUrl"] = BASE_URL + source_slug
    file.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return result


def source_sector(building):
    locality = building.get("Locality", {}).get("name") or building.get("locality", "")
    match = re.search(r"Sector[- ]*(\d+[a-zA-Z]?)", locality, re.I)
    return match[1] if match else "Film City" if "Film City" in locality else locality


AMENITIES = {"Power Back-Up": "Power Backup", "Internet / Wi-Fi": "Wi-Fi", "Lift": "Lift Access",
             "Reserved Parking": "Parking", "Visitors Parking": "Visitor Parking", "24x7 Security": "Security",
             "Conference Room": "Meeting Rooms", "Air Conditioned": "Air Conditioning"}


def export_record(row, source, note):
    status = "matched" if source else "sector-conflict" if note else "missing"
    record = {**row, "aliases": [], "source": {"url": source.get("sourceUrl") if source else None,
              "name": source.get("title", "").strip() if source else None, "status": status,
              "checkedAt": CHECKED_AT, "note": note}, "address": None, "specifications": [],
              "amenities": [], "photos": [], "units": [], "spaceType": None, "finishedTypes": [],
              "minArea": None, "maxArea": None, "nearestMetro": None, "coordinates": None}
    if not source:
        return record
    locality = "Film City, Noida" if row["sector"] == "Film City" else "Sector " + row["sector"] + ", Noida"
    record["address"] = ", ".join(dict.fromkeys(filter(None, [source.get("address", "").strip(), locality])))
    record["amenities"] = list(dict.fromkeys(AMENITIES.get(item, item) for item in source.get("amenities", [])))
    specifications = [("Configuration", source.get("builtFloorsInfo")), ("Total floors", source.get("totalFloors")),
                      ("Year built", source.get("builtYear")), ("Certification", source.get("certification")),
                      ("Air conditioning", source.get("airconditioningType")), ("Facing", source.get("facing"))]
    for field, label in [("builtUpArea", "Built-up area"), ("typicalFloor", "Typical floor plate")]:
        if isinstance(source.get(field), (int, float)) and source[field] > 0:
            specifications.append((label, f"{source[field]:,g} sq.ft."))
    if isinstance(source.get("parkingRatio"), (int, float)) and source["parkingRatio"] > 0:
        specifications.append(("Parking ratio", f"1 space per {source['parkingRatio']:,g} sq.ft."))
    record["specifications"] = [[label, str(value)] for label, value in specifications
                                if value and str(value).lower() not in ["none", "n/a", "na", "$undefined"]]
    record["nearestMetro"] = source.get("nearestMetro") or None
    for field in ["minArea", "maxArea"]:
        if isinstance(source.get(field), (int, float)) and source[field] > 0:
            record[field] = source[field]
    seen = set()
    for unit in source.get("availableUnits", []):
        area = unit.get("superArea")
        if isinstance(area, (int, float)) and area > 0 and area not in seen:
            seen.add(area)
            record["units"].append({"area": area, "workstations": unit.get("workstations") or None})
    coordinates = source.get("locationDetails", {}).get("coordinates", [])
    if len(coordinates) == 2:
        a, b = coordinates
        if 27 < a < 30 and 76 < b < 79:
            record["coordinates"] = {"lat": a, "lng": b}
        elif 27 < b < 30 and 76 < a < 79:
            record["coordinates"] = {"lat": b, "lng": a}
    prose = html.unescape(re.sub(r"<[^>]+>", " ", source.get("description", ""))).lower()
    record["spaceType"] = "Co-Working" if re.search(r"cowork|co-work", source["title"], re.I) else (
        "Managed Office" if re.search(r"managed (?:offices?|workspaces?)", prose) else "Conventional Leasing")
    if re.search(r"bare[- ]shell|ready[- ]to[- ]fit[- ]?out", prose):
        record["finishedTypes"].append("Bare shell")
    if re.search(r"semi[- ]furnished", prose):
        record["finishedTypes"].append("Semi-Furnished")
    if re.search(r"fully[- ]furnished|ready[- ]to[- ]move", prose):
        record["finishedTypes"].append("Ready-to-move")
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workbook", type=Path, default=ROOT / "public/Building sheet.xlsx")
    parser.add_argument("--cache", type=Path, default=Path(tempfile.gettempdir()) / "propmentor-estate-import")
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    rows = read_sheet(args.workbook)
    index_file = args.cache / "index.html"
    if not index_file.exists():
        index_file.write_text(download(BASE_URL + "office-space-rent"))
    values = [item for record in flight_records(index_file.read_text()).values() for item in walk(record)]
    properties = next(item["initialProperties"] for item in values if isinstance(item, dict) and "initialProperties" in item)
    buildings = [item for item in properties if item.get("propertyCategory") == "CommercialBuilding"]
    sitemap_file = args.cache / "sitemap.xml"
    if not sitemap_file.exists():
        sitemap_file.write_text(download(BASE_URL + "sitemap.xml"))
    sitemap_urls = re.findall(r"<loc>(.*?)</loc>", sitemap_file.read_text())
    jobs = []
    conflicts = {}
    for row in rows:
        candidates = [item for item in buildings if normalise(item["title"]) == normalise(row["name"])]
        match = next((item for item in candidates if normalise(source_sector(item)) == normalise(row["sector"])), None)
        if match:
            jobs.append((row, match["seoURL"]))
            continue
        if candidates:
            conflicts[row["sheetRow"]] = "; ".join(item["title"].strip() + " is listed in " + source_sector(item) for item in candidates)
            continue
        urls = [url for url in sitemap_urls if normalise(re.split(r"-build|-prop-", url.split("/")[-1])[0]) == normalise(row["name"])]
        if urls:
            jobs.append((row, urls[0].split("/")[-1]))
    sources = {}
    errors = []

    def fetch_job(job):
        row, source_slug = job
        try:
            return row, building_details(source_slug, args.cache), None
        except Exception as error:
            return row, None, str(error)

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for index, (row, source, error) in enumerate(pool.map(fetch_job, jobs), 1):
            if error:
                errors.append({"row": row["sheetRow"], "error": error})
            elif normalise(source_sector(source)) != normalise(row["sector"]):
                conflicts[row["sheetRow"]] = source["title"].strip() + " is listed in " + source_sector(source)
            else:
                sources[row["sheetRow"]] = source
            if index % 20 == 0:
                print(f"Building details: {index}/{len(jobs)}", flush=True)
    counts = {normalise(row["name"]): sum(normalise(item["name"]) == normalise(row["name"]) for item in rows) for row in rows}
    catalog = []
    image_jobs = []
    for row in rows:
        slug = slugify(row["name"])
        if counts[normalise(row["name"])] > 1:
            slug += "-sector-" + slugify(row["sector"])
        record = export_record({**row, "slug": slug}, sources.get(row["sheetRow"]), conflicts.get(row["sheetRow"]))
        catalog.append(record)
        if row["sheetRow"] in sources:
            urls = []
            for value in sources[row["sheetRow"]].get("images", []):
                match = re.search(r'https://storage\.googleapis\.com/estatelion-img/[^"\s]+', value)
                if match and match[0] not in urls:
                    urls.append(match[0])
            for index, url in enumerate(urls[:4]):
                image_jobs.append({"row": row["sheetRow"], "slug": slug, "index": index, "sourceUrl": url})
    manifest = args.cache / "images.json"
    manifest.write_text(json.dumps(image_jobs, indent=2))
    subprocess.run(["node", str(ROOT / "scripts/prepare-building-images.mjs"), str(manifest)], cwd=ROOT, check=True)
    image_results = json.loads(manifest.read_text())
    for record in catalog:
        record["photos"] = [{key: photo[key] for key in ["src", "width", "height", "sourceUrl"]}
                            for photo in image_results if photo["row"] == record["sheetRow"] and not photo.get("error")]
    target = ROOT / "src/data/building-catalog.json"
    target.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    report = ROOT / "docs/building-catalog-import.md"
    report.parent.mkdir(exist_ok=True)
    matched = sum(item["source"]["status"] == "matched" for item in catalog)
    lines = ["# Building catalog import", "", f"Imported {CHECKED_AT} from `public/Building sheet.xlsx`.", "",
             f"- Spreadsheet entries: {len(catalog)}; kept in spreadsheet order.",
             f"- Matching EstateLion building pages: {matched}.",
             f"- Entries awaiting matching details: {len(catalog) - matched}.",
             f"- Locally stored property photographs: {sum(len(item['photos']) for item in catalog)}.", "",
             "The spreadsheet controls inventory and sector. Public building pages control specifications, amenities, unit sizes, coordinates and photographs. Descriptions are composed from those facts, rather than copied from source prose. Current rents were not published on the matched building records, so prices remain on request. Source unit sizes are a dated reference; the team confirms availability.", "",
             "Repeated names in different sectors have separate URLs. A different-sector building is not substituted. Unsupported buildings have the spreadsheet location and an explicit on-request detail state, without unrelated photos or invented specifications.", "",
             "The source coordinate arrays are validated against Noida bounds before using latitude/longitude; both array orders are handled. Workspace formats and finishing options are taken from explicit building names/descriptions. Conventional leasing is used for ordinary office-building lease records. No unit rental price is inferred from an area or a per-square-foot rate.", "",
             "## Entries needing confirmation", "", "| Sheet row | Building | Sector | Reason |", "| --- | --- | --- | --- |"]
    for item in catalog:
        if item["source"]["status"] != "matched":
            note = item["source"]["note"] or "No matching public building detail page in the supplied EstateLion index or sitemap."
            lines.append(f"| {item['sheetRow']} | {item['name']} | {item['sector']} | {note} |")
    lines += ["", "## Matched sources", "", "| Sheet row | Building | Sector | Detail page |", "| --- | --- | --- | --- |"]
    for item in catalog:
        if item["source"]["url"]:
            lines.append(f"| {item['sheetRow']} | {item['name']} | {item['sector']} | [EstateLion]({item['source']['url']}) |")
    failures = errors + [item for item in image_results if item.get("error")]
    if failures:
        lines += ["", "## Import failures", "", "```json", json.dumps(failures, indent=2), "```"]
    lines += ["", "## Refresh", "", "Run `python3 scripts/import-building-catalog.py`. The default source cache is in the system temporary directory. Delete that cache to fetch a fresh snapshot. Existing optimized local photographs are reused.", ""]
    report.write_text("\n".join(lines))
    print(f"Imported {len(catalog)} buildings: {matched} matched, {len(catalog) - matched} awaiting details.", flush=True)


if __name__ == "__main__":
    main()

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Project } from "@/lib/project-types";
import {
  formatDistance, neighbourhoodCategories, placeDirectionsUrl,
  type Coordinates, type NearbyPlace, type NeighbourhoodCategory, type NeighbourhoodData,
} from "../lib/neighbourhood";
import styles from "./project-map.module.css";
import { ChevronLeft, ChevronRight } from "./icons";

const nearbyPageSize = 3;

function CategoryIcon({ category }: { category: NeighbourhoodCategory }) {
  const paths = {
    connectivity: "M7 3h10a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 10h14M8 15h.01M16 15h.01M8 19l-2 3M16 19l2 3M10 3V1h4v2",
    business: "M9 7V4h6v3M3 7h18v13H3V7ZM3 12c5 4 13 4 18 0M12 12v4",
    dining: "M4 2v6a3 3 0 0 0 6 0V2M7 2v20M20 22V2c-5 3-5 10 0 10",
    hospitality: "M5 22V3h14v19M2 22h20M9 22v-5h6v5M9 7h.01M15 7h.01M9 12h.01M15 12h.01",
    shopping: "M5 7h14l2 14H3L5 7ZM8 8V5a4 4 0 0 1 8 0v3M8 12c0 5 8 5 8 0",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[category]} /></svg>;
}

function DirectionIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 18-7-7 18-3-8-8-3ZM11 13l10-10" /></svg>;
}

export function ProjectMap({ project }: { project: Project }) {
  const coords = project.detail.location.coordinates;
  const root = useRef<HTMLDivElement>(null);
  const resultsId = useId();
  const [category, setCategory] = useState<NeighbourhoodCategory>("connectivity");
  const [type, setType] = useState("All");
  const [data, setData] = useState<NeighbourhoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [placePage, setPlacePage] = useState(0);
  const activeCategory = neighbourhoodCategories.find(item => item.id === category)!;
  const places = useMemo(() => (data?.places ?? []).filter(place => place.category === category && (type === "All" || place.type === type)), [data, category, type]);
  const pageCount = Math.ceil(places.length / nearbyPageSize);
  const currentPage = Math.min(placePage, Math.max(0, pageCount - 1));
  const placeOffset = currentPage * nearbyPageSize;
  const visiblePlaces = useMemo(() => places.slice(placeOffset, placeOffset + nearbyPageSize), [places, placeOffset]);
  const searchTerm = category === "dining" ? "restaurants and cafes" : category === "connectivity" ? "metro stations and bus stops" : category === "hospitality" ? "hotels" : category === "business" ? "offices and banks" : "shopping malls and supermarkets";
  const searchQuery = `${type === "All" ? searchTerm : type} near ${project.detail.location.directionsQuery}`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.detail.location.directionsQuery)}`;

  useEffect(() => {
    const element = root.current;
    if (!element || !coords) return;
    const controller = new AbortController();
    let disposed = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      async function load() {
        try {
          const response = await fetch(`/api/projects/${encodeURIComponent(project.slug)}/neighbourhood`, { signal: controller.signal });
          if (!response.ok) throw new Error("Nearby search unavailable");
          const result: NeighbourhoodData = await response.json();
          if (!disposed) setData(result);
        } catch {
          if (!disposed) setData({ places: [], radius: 5000, availability: "unavailable" });
        } finally {
          if (!disposed) setLoading(false);
        }
      }
      void load();
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); controller.abort(); };
  }, [project.slug, coords, attempt]);

  function selectCategory(next: NeighbourhoodCategory) {
    setCategory(next); setType("All"); setSelected(null); setExpanded(true); setPlacePage(0);
  }

  function changePlacePage(next: number) {
    setPlacePage(next);
    setSelected(null);
  }

  return <div className={styles.explorer} ref={root}>
    <div className={styles.explorerIntro}><span>EXPLORE THE NEIGHBOURHOOD</span><p>A closer look at life around your workspace.</p></div>
    {coords
      ? <CoordinateProjectMap project={project} coords={coords} places={visiblePlaces} placeOffset={placeOffset} selected={selected} onSelect={setSelected} directionsUrl={directionsUrl} />
      : <div className={styles.mapWrapper}><iframe className={styles.mapEmbed} title={`Explore ${activeCategory.label.toLowerCase()} near ${project.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>}

    <div className={styles.explorerBody}>
      <div className={styles.categories} role="group" aria-label="Neighbourhood categories">
        {neighbourhoodCategories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => selectCategory(item.id)}><span><CategoryIcon category={item.id} /></span>{item.label}</button>)}
      </div>
      <div className={styles.filters} role="group" aria-label={`${activeCategory.label} filters`}>
        {["All", ...activeCategory.types].map(item => <button type="button" key={item} aria-pressed={type === item} onClick={() => { setType(item); setSelected(null); setExpanded(true); setPlacePage(0); }}>{item}</button>)}
      </div>
      <div className={styles.results}>
        <button type="button" className={styles.resultsHeading} aria-expanded={expanded} aria-controls={resultsId} onClick={() => setExpanded(value => !value)}>
          <CategoryIcon category={category} /><span>{activeCategory.label}<small aria-live="polite">{!coords ? "Explore the surrounding area" : loading ? "Finding nearby places…" : `${places.length} ${places.length === 1 ? "place" : "places"} within 5 km`}</small></span><svg className={styles.chevron} data-expanded={expanded} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div id={resultsId} hidden={!expanded}>
          {coords && loading && <div className={styles.loadingState} role="status"><span />Discovering what’s around {project.name}…</div>}
          {coords && !loading && visiblePlaces.length > 0 && <ol className={styles.placeList} start={placeOffset + 1} aria-label={`Nearby ${activeCategory.label.toLowerCase()}`}>
            {visiblePlaces.map((place, index) => <li key={place.id} data-selected={selected === place.id}>
              <button type="button" className={styles.placeButton} onClick={() => setSelected(place.id)} aria-pressed={selected === place.id} aria-label={`Show ${place.name} on map`}><span className={styles.placeNumber}>{placeOffset + index + 1}</span><span className={styles.placeName}>{place.name}<small>{place.type}</small></span><span className={styles.distance}>{formatDistance(place.distance)}</span></button>
              <a className={styles.placeDirections} href={placeDirectionsUrl(place, coords)} target="_blank" rel="noopener noreferrer" aria-label={`Get directions from ${project.name} to ${place.name}`}><DirectionIcon /></a>
            </li>)}
          </ol>}
          {coords && !loading && pageCount > 1 && <nav className={styles.placePagination} aria-label="Nearby places pages">
            <span role="status" aria-live="polite">{placeOffset + 1}–{Math.min(placeOffset + nearbyPageSize, places.length)} of {places.length} places</span>
            <div>
              <button type="button" aria-label="Previous nearby places" aria-controls={resultsId} disabled={currentPage === 0} onClick={() => changePlacePage(currentPage - 1)}><ChevronLeft /></button>
              <button type="button" aria-label="Next nearby places" aria-controls={resultsId} disabled={currentPage === pageCount - 1} onClick={() => changePlacePage(currentPage + 1)}><ChevronRight /></button>
            </div>
          </nav>}
          {!coords && <p className={styles.emptyState}>Explore nearby {activeCategory.label.toLowerCase()} on Google Maps. Exact distances will be available once this property’s map pin is confirmed.</p>}
          {coords && !loading && !visiblePlaces.length && <p className={styles.emptyState}>{data?.availability === "unavailable" ? "Nearby places couldn’t be loaded right now." : `No ${type === "All" ? activeCategory.label.toLowerCase() + " places" : type.toLowerCase()} are listed within 5 km. Try another filter or explore on Google Maps.`}</p>}
          {coords && !loading && data?.availability === "unavailable" && <div className={styles.retryRow}><span>{visiblePlaces.length ? "Showing catalogue properties. More nearby places are temporarily unavailable." : "Try again to refresh nearby places."}</span><button type="button" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div>}
          <a className={styles.exploreLink} href={searchUrl} target="_blank" rel="noopener noreferrer">Explore {type === "All" ? activeCategory.label.toLowerCase() : type.toLowerCase()} on Google Maps <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      {coords && <p className={styles.sourceNote}>Approximate straight-line distances within 5 km. Routes may be longer.</p>}
    </div>
  </div>;
}

function CoordinateProjectMap({ project, coords, places, placeOffset, selected, onSelect, directionsUrl }: {
  project: Project; coords: Coordinates; places: NearbyPlace[]; placeOffset: number; selected: string | null;
  onSelect: (id: string) => void; directionsUrl: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false;
    let resize: ResizeObserver | undefined;
    let tiles: TileLayer | undefined;
    let loadedTile = false;
    const currentMarkers = markers.current;
    async function initialise() {
      try {
        const L = await import("leaflet");
        if (disposed) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const instance = L.map(element!, { center: [coords.lat, coords.lng], zoom: 14, scrollWheelZoom: false, zoomControl: false, minZoom: 10, maxZoom: 19, fadeAnimation: !reduced, zoomAnimation: !reduced, markerZoomAnimation: !reduced });
        map.current = instance;
        L.control.zoom({ position: "topright" }).addTo(instance);
        tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors', maxZoom: 19, keepBuffer: 1,
        });
        tiles.on("tileload", () => { loadedTile = true; if (!disposed) setStatus("ready"); });
        tiles.on("load", () => { if (!disposed && !loadedTile) setStatus("error"); });
        tiles.addTo(instance);
        const label = document.createElement("span");
        label.className = styles.propertyPin;
        label.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V3h14v18M2 21h20M9 7h.01M15 7h.01M9 11h.01M15 11h.01M10 21v-5h4v5" /></svg>';
        const pin = L.marker([coords.lat, coords.lng], { title: project.name, alt: project.name, zIndexOffset: 1000, icon: L.divIcon({ className: styles.mainMarker, html: label, iconSize: [42, 48], iconAnchor: [21, 44] }) }).addTo(instance);
        const content = document.createElement("div");
        content.className = styles.popupCard;
        const title = document.createElement("strong"); title.textContent = project.name;
        const address = document.createElement("p"); address.textContent = project.detail.location.address;
        content.append(title, address);
        pin.bindPopup(content);
        resize = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
        resize.observe(element!);
        setReady(true);
      } catch { if (!disposed) setStatus("error"); }
    }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); void initialise(); } });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); resize?.disconnect(); tiles?.off(); map.current?.remove(); map.current = null; currentMarkers.clear(); };
  }, [coords.lat, coords.lng, project.name, project.detail.location.address]);

  useEffect(() => {
    if (!ready || !map.current) return;
    let disposed = false;
    const instance = map.current;
    const currentMarkers = markers.current;
    async function update() {
      const L = await import("leaflet");
      if (disposed) return;
      currentMarkers.forEach(marker => marker.remove()); currentMarkers.clear();
      for (const [index, place] of places.entries()) {
        const number = document.createElement("span"); number.textContent = String(placeOffset + index + 1); number.className = styles.poiNumber;
        const marker = L.marker([place.lat, place.lng], { title: place.name, alt: place.name, icon: L.divIcon({ className: styles.poiMarker, html: number, iconSize: [34, 40], iconAnchor: [17, 36] }) }).addTo(instance);
        const popup = document.createElement("div"); popup.className = styles.popupCard;
        const name = document.createElement("strong"); name.textContent = place.name;
        const caption = document.createElement("p"); caption.textContent = `${place.type} · ${formatDistance(place.distance)} away`;
        const link = document.createElement("a"); link.textContent = "Get directions ↗"; link.href = placeDirectionsUrl(place, coords); link.target = "_blank"; link.rel = "noopener noreferrer";
        popup.append(name, caption, link); marker.bindPopup(popup, { maxWidth: 220, autoPanPadding: [24, 24] });
        marker.on("click", () => onSelect(place.id));
        currentMarkers.set(place.id, marker);
      }
      const bounds = L.latLngBounds([[coords.lat, coords.lng], ...places.map(place => [place.lat, place.lng] as [number, number])]);
      instance.fitBounds(bounds, { paddingTopLeft: [36, 56], paddingBottomRight: [36, 58], maxZoom: 15, animate: false });
    }
    void update();
    return () => { disposed = true; currentMarkers.forEach(marker => marker.remove()); currentMarkers.clear(); };
  }, [ready, places, placeOffset, coords, onSelect]);

  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((item, id) => { item.getElement()?.setAttribute("data-selected", String(id === selected)); item.setZIndexOffset(id === selected ? 500 : 0); });
    if (!selected) { map.current.closePopup(); return; }
    const marker = markers.current.get(selected);
    if (marker) { map.current.panTo(marker.getLatLng(), { animate: false }); marker.openPopup(); }
  }, [ready, selected]);

  return <div className={styles.mapWrapper}>
    <div ref={container} className={styles.mapCanvas} role="region" aria-label={`Interactive neighbourhood map for ${project.name}`} />
    <div className={styles.propertyLabel}><span />{project.name}</div>
    <div className={styles.mapFloatingBar}>
      <button type="button" className={styles.floatingBtn} onClick={() => { map.current?.closePopup(); map.current?.setView([coords.lat, coords.lng], 15, { animate: false }); }} aria-label={`Recenter on ${project.name}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>Recenter</button>
      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.floatingBtn}><DirectionIcon />Directions</a>
    </div>
    {status === "error" && <div className={styles.mapNotice} role="status">Map tiles are unavailable. <a href={directionsUrl} target="_blank" rel="noopener noreferrer">Open Google Maps ↗</a></div>}
  </div>;
}

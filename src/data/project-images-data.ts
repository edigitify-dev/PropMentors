import type { ProjectImage } from "./projects";
import cloudinaryMapJson from "../../cloudinary-map.json";

const cloudinaryMap = cloudinaryMapJson as Record<string, string>;

export interface ProjectMedia {
  cover: ProjectImage;
  gallery: ProjectImage[];
  views: {
    interior: ProjectImage;
    exterior: ProjectImage;
    floorPlan?: ProjectImage;
  };
}

interface RawImage {
  file: string;
  width: number;
  height: number;
  isInterior?: boolean;
}

const rawProjectMedia: Record<string, { folder: string; images: RawImage[] }> = {
  "ats-bouquet": {
    folder: "ATS Bouquet",
    images: [
      { file: "597gqv.webp", width: 1920, height: 1280 },
      { file: "e6gvp8.webp", width: 1920, height: 1280 },
      { file: "63k5tx.webp", width: 1920, height: 1280 },
      { file: "m8csrd.webp", width: 1920, height: 1279 },
      { file: "rbfaek.webp", width: 1920, height: 1279 },
      { file: "63b950de944baf1d5d8eb2bc_WhatsApp Image 2022-12-28 at 21.20.28 (3).jpeg", width: 1200, height: 1600, isInterior: true },
      { file: "images.jpeg", width: 678, height: 452 },
      { file: "images 2.jpeg", width: 547, height: 365 },
    ],
  },
  "advant-navis-business-park": {
    folder: "Advant navis",
    images: [
      { file: "8540303Advant Navis-Sector-142.png", width: 2000, height: 1200 },
      { file: "Magnificent-view-of-Advant-Navis-Business-Park_0_1200.jpeg", width: 1200, height: 675 },
      { file: "advant-navis-1.jpg", width: 1360, height: 850 },
      { file: "ai0i1080.jpg", width: 2000, height: 1333 },
      { file: "rb88k9.jpg", width: 2198, height: 1148 },
      { file: "zrnqtg.webp", width: 1920, height: 1441 },
      { file: "advant-navis-business-park-noida-sector-142-noida-business-centres-2n87tet7z8.jpg.avif", width: 1452, height: 2000, isInterior: true },
      { file: "images 1.jpeg", width: 591, height: 338 },
      { file: "images.jpeg", width: 399, height: 501 },
    ],
  },
  "advant-it-park": {
    folder: "Advant navis",
    images: [
      { file: "8540303Advant Navis-Sector-142.png", width: 2000, height: 1200 },
      { file: "Magnificent-view-of-Advant-Navis-Business-Park_0_1200.jpeg", width: 1200, height: 675 },
      { file: "advant-navis-1.jpg", width: 1360, height: 850 },
      { file: "ai0i1080.jpg", width: 2000, height: 1333 },
      { file: "rb88k9.jpg", width: 2198, height: 1148 },
      { file: "zrnqtg.webp", width: 1920, height: 1441 },
    ],
  },
  "assotech-business-cresterra": {
    folder: "Assotech Business Cresterra",
    images: [
      { file: "uzsf83.webp", width: 1920, height: 1280 },
      { file: "serviced-offices-assotech-business-cresterra-tower-2-plot-no-22-sector-135--0-hero.jpg", width: 1200, height: 800, isInterior: true },
      { file: "2njj2q.webp", width: 1920, height: 1280 },
      { file: "8jex87.webp", width: 1920, height: 1278 },
      { file: "v9qj7d.webp", width: 1920, height: 1278 },
      { file: "images-1664215258463.jpg", width: 1440, height: 1080 },
      { file: "1773212177_Office Space Near Noida Electronic City Metro Station.webp", width: 700, height: 400 },
      { file: "images.jpeg", width: 591, height: 338 },
    ],
  },
  "aykon-tower": {
    folder: "Aykon Tower",
    images: [
      { file: "3twaay.webp", width: 1920, height: 1280 },
      { file: "ctmndh.webp", width: 1920, height: 1280 },
      { file: "u629bc.webp", width: 1920, height: 1280 },
      { file: "1.jpg", width: 1440, height: 960 },
      { file: "nqttf7.jpg", width: 1440, height: 960 },
      { file: "g6ujyf.webp", width: 1920, height: 1648, isInterior: true },
      { file: "images.jpeg", width: 447, height: 447 },
    ],
  },
  "bhutani-cyberthum": {
    folder: "Bhutani Cyberthum",
    images: [
      { file: "131d8f61fc8ede5f369cd69d7e0c01c1.webp", width: 1500, height: 1200 },
      { file: "cyberthum-1.jpg.webp", width: 960, height: 1280 },
      { file: "images 2.jpeg", width: 739, height: 415 },
      { file: "images.jpeg", width: 476, height: 420 },
    ],
  },
  "boulevard": {
    folder: "Boulevard",
    images: [
      { file: "fxgxqa.webp", width: 1920, height: 1280 },
      { file: "d6gfxz.webp", width: 1920, height: 1056 },
      { file: "kc86m8.jpg", width: 1620, height: 1080 },
      { file: "preu7a.webp", width: 1920, height: 976 },
      { file: "1782118402_2qa.jpg.webp", width: 1600, height: 1200, isInterior: true },
      { file: "1769768760_12.jpg.webp", width: 1600, height: 1121 },
      { file: "1764935888181-9bke1fwqpr.jpeg", width: 1440, height: 1080 },
      { file: "tech-boulevard-noida-sector-127-noida-construction-companies-zdpDrPrqPB.jpg.avif", width: 1728, height: 3072 },
    ],
  },
  "candor-techspace-n1": {
    folder: "Candor TechSpace",
    images: [
      { file: "x8n6ck.webp", width: 1920, height: 1279 },
      { file: "Interior_1_7553bdd46f.jpg", width: 1424, height: 842, isInterior: true },
      { file: "1.jpg", width: 1440, height: 960 },
      { file: "3.jpg", width: 1440, height: 960 },
      { file: "N2_Tower_3_and_4_lobby_bbb1e9eb3f.jpg", width: 2500, height: 2233, isInterior: true },
      { file: "Amenties_9bda92e24e.jpg", width: 1424, height: 837 },
      { file: "candor-techspace-noida-corporate-companies-gjbl7b18fs.jpg.avif", width: 1334, height: 2000 },
      { file: "Our_Grade_A_Portfolio_2_e619592ae0.png", width: 630, height: 766 },
    ],
  },
  "candor-techspace-n2": {
    folder: "Candor TechSpace",
    images: [
      { file: "1.jpg", width: 1440, height: 960 },
      { file: "N2_Tower_3_and_4_lobby_bbb1e9eb3f.jpg", width: 2500, height: 2233, isInterior: true },
      { file: "x8n6ck.webp", width: 1920, height: 1279 },
      { file: "Interior_1_7553bdd46f.jpg", width: 1424, height: 842, isInterior: true },
      { file: "3.jpg", width: 1440, height: 960 },
      { file: "Amenties_9bda92e24e.jpg", width: 1424, height: 837 },
    ],
  },
  "dlf-techpark": {
    folder: "DLF Techpark",
    images: [
      { file: "v7m7eg.webp", width: 1920, height: 1280 },
      { file: "techpark-noida-reception-waiting-room-160880696.jpeg", width: 1928, height: 800, isInterior: true },
      { file: "vb59rz.webp", width: 1920, height: 1280 },
      { file: "whjgtj.webp", width: 1920, height: 1280 },
      { file: "techpark-noida-reception-waiting-room-160880698.jpeg", width: 1928, height: 800, isInterior: true },
      { file: "office_header_1749723408.jpg", width: 1920, height: 800 },
      { file: "property_image_6842e7665e56b.jpg", width: 670, height: 600 },
    ],
  },
  "embassy-oxygen-business-park": {
    folder: "Embassy Oxygen Business Park",
    images: [
      { file: "74c53p.webp", width: 1920, height: 1280 },
      { file: "images-1673262847125.jpg", width: 1440, height: 1080, isInterior: true },
      { file: "images-1673262847182.jpg", width: 1440, height: 1080 },
      { file: "images-1673262847282.jpg", width: 1440, height: 1080 },
      { file: "images 2.jpeg", width: 547, height: 365 },
      { file: "images 3.jpeg", width: 547, height: 365 },
      { file: "embassy_oxygen_gallery_1.png", width: 450, height: 228 },
      { file: "embassy_oxygen_gallery_12.png", width: 450, height: 228 },
    ],
  },
  "exotica-one32": {
    folder: "Exotica One32",
    images: [
      { file: "zdfqynn_1755318976_633861585_O-scaled.jpg", width: 2560, height: 1560 },
      { file: "Offices-0-1024x779.webp", width: 1024, height: 779, isInterior: true },
      { file: "Retail-0.webp", width: 1314, height: 1000 },
      { file: "images.jpeg", width: 736, height: 416 },
      { file: "images 2.jpeg", width: 564, height: 354 },
    ],
  },
  "express-trade-tower-i": {
    folder: "Express Trade Tower",
    images: [
      { file: "ETT2-01.webp", width: 2509, height: 1592 },
      { file: "coworking-express-trade-tower-noida-2-hero.jpg", width: 777, height: 437, isInterior: true },
      { file: "dzhnm9.webp", width: 1920, height: 1279 },
      { file: "1762853600_cow1.jpg.webp", width: 1600, height: 1067, isInterior: true },
      { file: "images-1675882879200.jpg", width: 1440, height: 1080 },
      { file: "1769341992_PHOTO-2026-01-24-17-07-41.jpg.webp", width: 1156, height: 867 },
      { file: "1755066675_express-trade-tower-2-sector-132-noida.webp", width: 700, height: 400 },
    ],
  },
  "express-trade-tower-ii": {
    folder: "Express Trade Tower",
    images: [
      { file: "dzhnm9.webp", width: 1920, height: 1279 },
      { file: "1762853600_cow1.jpg.webp", width: 1600, height: 1067, isInterior: true },
      { file: "ETT2-01.webp", width: 2509, height: 1592 },
      { file: "coworking-express-trade-tower-noida-2-hero.jpg", width: 777, height: 437, isInterior: true },
      { file: "images-1675882879200.jpg", width: 1440, height: 1080 },
      { file: "1769341992_PHOTO-2026-01-24-17-07-41.jpg.webp", width: 1156, height: 867 },
    ],
  },
  "fairfox-eon-eye-of-noida": {
    folder: "Fairfox EON",
    images: [
      { file: "hero.webp", width: 1814, height: 867 },
      { file: "Eon.jpg", width: 1620, height: 908 },
      { file: "385994578.webp", width: 1360, height: 738 },
      { file: "p1.webp", width: 1326, height: 1186, isInterior: true },
    ],
  },
  "gulshan-one29": {
    folder: "Gulshan one29 mall",
    images: [
      { file: "2026-08-19_05-06-27_20241022T115741_gall1.webp", width: 1500, height: 718 },
      { file: "entrance_2_1755599379240.jpg.avif", width: 1280, height: 720, isInterior: true },
      { file: "245374035.webp", width: 1360, height: 738 },
      { file: "overview.webp", width: 1200, height: 1268 },
      { file: "images.jpeg", width: 596, height: 335 },
      { file: "Screenshot 2026-10-14 at 2.22.30 PM.png", width: 2924, height: 1288 },
    ],
  },
  "jask": {
    folder: "Jask sec 125",
    images: [
      { file: "8479pc.webp", width: 1920, height: 1280 },
      { file: "3ee6t2.webp", width: 1920, height: 1263 },
      { file: "76373a.webp", width: 1920, height: 1210 },
      { file: "1770367019_12.jpg.webp", width: 1600, height: 1121, isInterior: true },
      { file: "1726741157054-1.jpg", width: 1440, height: 1080 },
      { file: "1764662859_1qwsdcv.jpg.webp", width: 1280, height: 768 },
      { file: "g6ujyf.webp", width: 1920, height: 1648 },
      { file: "images 2.jpeg", width: 638, height: 480 },
    ],
  },
  "logix-technova": {
    folder: "Logix Technova",
    images: [
      { file: "Logic technova.webp", width: 1920, height: 1279 },
      { file: "axh758.webp", width: 1920, height: 1440 },
      { file: "83csvp.webp", width: 1920, height: 1440 },
      { file: "xa43e8.webp", width: 1920, height: 1440 },
      { file: "logix-technova-sector-132-noida-2026-05-19-6a0c2225699bf.webp", width: 4096, height: 3072 },
      { file: "technova-others-157912874.jpeg", width: 4032, height: 3024, isInterior: true },
    ],
  },
  "max-square": {
    folder: "Max towers 129",
    images: [
      { file: "max-towers-spotlight-2.jpg", width: 1920, height: 1080 },
      { file: "amenities.jpg", width: 1090, height: 900, isInterior: true },
      { file: "1746718949113-lsae2cmwo1.jpeg", width: 1600, height: 1198 },
      { file: "1746718948699-c5q8jdpied.jpeg", width: 1440, height: 1080 },
      { file: "1746718947865-byr50dkalf.jpeg", width: 1440, height: 1080 },
      { file: "images.jpeg", width: 678, height: 452 },
    ],
  },
  "max-towers": {
    folder: "Max towers sec 16",
    images: [
      { file: "max-towers-spotlight-4.jpg", width: 1920, height: 1080 },
      { file: "max-towers-big-2.jpg", width: 1600, height: 900 },
      { file: "v9d22d.webp", width: 1920, height: 1281 },
      { file: "images-1658168180709.jpg", width: 1440, height: 1080, isInterior: true },
      { file: "images.jpeg", width: 705, height: 435 },
    ],
  },
  "3-riana": {
    folder: "Riana",
    images: [
      { file: "1751091371336-s3h40lpvuv.jpeg", width: 1440, height: 1080 },
      { file: "bfycwj.webp", width: 1920, height: 1920 },
      { file: "1763980634_1abcdef.jpg.webp", width: 1280, height: 960, isInterior: true },
      { file: "1763031089_raina-8.jpg.webp", width: 1152, height: 868 },
      { file: "g6.jpg.webp", width: 996, height: 560 },
      { file: "1777290803824.jpeg", width: 800, height: 1066 },
      { file: "images.jpeg", width: 547, height: 365 },
    ],
  },
  "sikka-mall-of-noida": {
    folder: "Sikka Mall of Noida",
    images: [
      { file: "1753603479506-73xy5ghq1m.jpeg", width: 1440, height: 1080 },
      { file: "990991418.webp", width: 1360, height: 738 },
      { file: "crt-0l-0w-100h-100.webp", width: 1280, height: 960, isInterior: true },
      { file: "sikka-mall-noida-sector-98-noida-malls-n6g24nnbmb.jpg.avif", width: 768, height: 512 },
    ],
  },
  "skymark-one": {
    folder: "Skymark",
    images: [
      { file: "Skymark one 4.jpeg", width: 1964, height: 1248 },
      { file: "6nkftb.webp", width: 1920, height: 1280 },
      { file: "Skymark one 3.jpeg", width: 1920, height: 1280 },
      { file: "kgtsk8.webp", width: 1920, height: 1280 },
      { file: "q6mze7.webp", width: 1920, height: 1280 },
      { file: "tb3259.webp", width: 1920, height: 1280 },
      { file: "Skymark one 2.jpeg", width: 1440, height: 1080, isInterior: true },
      { file: "images-1660636297555.jpg", width: 1440, height: 1080 },
      { file: "images-1660636297787.jpg", width: 1440, height: 1080 },
      { file: "Skymark one 1.webp", width: 1000, height: 1000 },
    ],
  },
  "sovereign-corporate-towers": {
    folder: "Sovereign Corporate Towers",
    images: [
      { file: "1763639136640-ahpfqn5io6.jpeg", width: 4032, height: 3024 },
      { file: "2612002-sovereign-corporate-tower-11th-floor-a-143-sec-136-noida-expressway.jpg.webp", width: 2000, height: 1080, isInterior: true },
      { file: "jocptsf_1705320010_467404784.jpg", width: 4000, height: 1800 },
      { file: "2rmkrz.webp", width: 1920, height: 1280 },
      { file: "1784042-sovereign-corporate-tower-11th-floor-a-143-sec-136-noida-expressway.jpg.webp", width: 1440, height: 1080, isInterior: true },
      { file: "8854862-sovereign-corporate-tower-11th-floor-a-143-sec-136-noida-expressway.jpg", width: 1200, height: 900 },
      { file: "1773123066_office space for rent in sector 142 noida.webp", width: 700, height: 400 },
      { file: "image-95835e1709665aecd2a9843f20f06f9d20fab7a6-D-Ddx10f.avif", width: 584, height: 390 },
    ],
  },
  "stellar-135": {
    folder: "Stellar 135",
    images: [
      { file: "38rdmx.webp", width: 1920, height: 1280 },
      { file: "int4owxb.jpg", width: 1200, height: 797, isInterior: true },
      { file: "6ev887.webp", width: 1920, height: 1282 },
      { file: "8uxw3e.webp", width: 1920, height: 1282 },
      { file: "b5ws2k.jpg", width: 1623, height: 1080 },
      { file: "stellar-135-noida-sector-135-noida-corporate-companies-iw0v9tyuy9.jpg.avif", width: 1728, height: 1152 },
      { file: "1776842959_office space  for rent in sector 62 noida.webp", width: 700, height: 400 },
    ],
  },
  "utc": {
    folder: "UTC ",
    images: [
      { file: "UTC-Banner.jpg", width: 1920, height: 1100 },
      { file: "NPX-1.jpg", width: 1920, height: 1100 },
      { file: "gnh3kw.webp", width: 1920, height: 1280 },
      { file: "1.jpg", width: 1440, height: 960 },
      { file: "UTP-project-11.jpg", width: 1296, height: 864, isInterior: true },
      { file: "images 2.jpeg", width: 678, height: 452 },
      { file: "images 3.jpeg", width: 678, height: 452 },
      { file: "images 4.jpeg", width: 640, height: 480 },
    ],
  },
  "urbtech-trade-centre-npx": {
    folder: "UTC ",
    images: [
      { file: "NPX-1.jpg", width: 1920, height: 1100 },
      { file: "UTC-Banner.jpg", width: 1920, height: 1100 },
      { file: "gnh3kw.webp", width: 1920, height: 1280 },
      { file: "UTP-project-11.jpg", width: 1296, height: 864, isInterior: true },
      { file: "1.jpg", width: 1440, height: 960 },
    ],
  },
  "windsor-grand": {
    folder: "Windsor",
    images: [
      { file: "Windsor-01.webp", width: 2510, height: 1592 },
      { file: "5rr2ds.webp", width: 1920, height: 1085 },
      { file: "8c9u37.webp", width: 1920, height: 1280 },
      { file: "bv5kvv.webp", width: 1920, height: 1280 },
      { file: "n54e2u.webp", width: 1920, height: 1280 },
      { file: "images-1663857639831.jpg", width: 1440, height: 1080, isInterior: true },
      { file: "1745321319927.jpeg", width: 1360, height: 907 },
    ],
  },
};

// Match renamed catalog entries to the supplied collection by building and sector.
// JASK's supplied folder is Sector 125; the catalog also has a separate Sector 127 tower.
const suppliedMediaAliases: Record<string, string> = {
  "tech-boulevard": "boulevard",
  "candor-techspace-sector-135": "candor-techspace-n1",
  "dlf-tech-park": "dlf-techpark",
  "express-trade-tower": "express-trade-tower-i",
  "jask-tower-sector-125": "jask",
};

export function getProjectMedia(slug: string, projectName = "Commercial Office Tower"): ProjectMedia | null {
  const data = rawProjectMedia[suppliedMediaAliases[slug] ?? slug];
  if (!data || !data.images.length) return null;

  const gallery: ProjectImage[] = data.images.map((img, index) => {
    const key = `${data.folder}/${img.file}`;
    const src = cloudinaryMap[key] || `/Website%20Images/${encodeURIComponent(data.folder)}/${encodeURIComponent(img.file)}`;
    return {
      id: `${slug}-img-${index + 1}`,
      src,
      alt: `${projectName} - Photograph ${index + 1}`,
      width: img.width,
      height: img.height,
      cropWidth: 400,
      cropHeight: 260,
      cropTop: 0,
    };
  });

  const cover = gallery[0];
  const interiorImage = gallery.find((_, idx) => data.images[idx].isInterior) || gallery[1] || gallery[0];
  const exteriorImage = gallery[0];

  return {
    cover,
    gallery,
    views: {
      exterior: exteriorImage,
      interior: interiorImage,
      floorPlan: undefined,
    },
  };
}

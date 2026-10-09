export type ProjectImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  cropWidth: number;
  cropHeight: number;
  cropTop: number;
};

export type ProjectFact = [label: string, value: string];
export type WorkspaceOption = {
  id: string;
  title: string;
  location: string;
  description: string;
  badge: string;
  image: ProjectImage;
};

// Every card and detail page reads the same record. Images use explicit paths,
// so adding a project doesn't require naming its assets after its ID or slug.
export type Project = {
  id: string;
  slug: string;
  aliases?: string[];
  name: string;
  location: string;
  locationLabel: string;
  type: string;
  category: string;
  badge: string;
  price: number;
  features: string[];
  cover: ProjectImage;
  spaceType?: string;
  amenities?: string[];
  detail: {
    description: string;
    overview: ProjectFact[];
    building: ProjectFact[];
    amenities: string[];
    gallery: ProjectImage[];
    spaces: WorkspaceOption[];
    location: { address: string; caption: string; directionsQuery: string; map: ProjectImage; nearby: ProjectFact[] };
    views: { floorPlan?: ProjectImage; interior: ProjectImage; exterior: ProjectImage };
    startingPrice: string;
    startingPriceUnit: string;
    highlights: string[];
    benefits: { title: string; description: string }[];
    similarProjectIds: string[];
  };
};

const photos: Record<string, ProjectImage> = {
  "space-01": { id: "space-01", src: "/images/spaces/space-01.png", width: 1152, height: 2040, cropWidth: 401, cropHeight: 709, cropTop: 314, alt: "Ocean-facing living room with floor-to-ceiling windows" },
  "space-02": { id: "space-02", src: "/images/spaces/space-02.png", width: 736, height: 1051, cropWidth: 401, cropHeight: 572, cropTop: 92, alt: "Modern hillside home with an infinity pool and city views" },
  "space-03": { id: "space-03", src: "/images/spaces/space-03.png", width: 1199, height: 1062, cropWidth: 400, cropHeight: 354, cropTop: 38, alt: "Contemporary cream-colored villa with a landscaped entrance" },
  "space-04": { id: "space-04", src: "/images/spaces/space-04.png", width: 736, height: 1308, cropWidth: 401, cropHeight: 712, cropTop: 268, alt: "Sunlit living room overlooking a lake and mountains" },
  "space-05": { id: "space-05", src: "/images/spaces/space-05.png", width: 1080, height: 1920, cropWidth: 400, cropHeight: 712, cropTop: 167, alt: "Modern two-story villa with a garden and swimming pool" },
  "space-06": { id: "space-06", src: "/images/spaces/space-06.png", width: 736, height: 1104, cropWidth: 400, cropHeight: 600, cropTop: 145, alt: "Poolside home illuminated at sunset" },
};

const sampleProjects = [
  { id: "space-01", slug: "godrej-south-estate-dlf-camellias", aliases: ["kr-signature-sector-135"], name: "Godrej South Estate, DLF Camellias", badge: "DVS signature", gallery: ["space-01", "space-04", "space-05", "space-06"], startingPrice: "₹900" },
  { id: "space-02", slug: "skyline-residences", name: "Skyline Residences", badge: "RERA Approved", gallery: ["space-02", "space-06", "space-04", "space-05"], startingPrice: "₹950" },
  { id: "space-03", slug: "garden-court-villas", name: "Garden Court Villas", badge: "new", gallery: ["space-03", "space-05", "space-04", "space-01"], startingPrice: "₹850" },
  { id: "space-04", slug: "lakeside-residences", name: "Lakeside Residences", badge: "sold out", gallery: ["space-04", "space-01", "space-06", "space-02"], startingPrice: "₹1,100" },
  { id: "space-05", slug: "parkside-villas", name: "Parkside Villas", badge: "DVS signature", gallery: ["space-05", "space-03", "space-04", "space-06"], startingPrice: "₹1,000" },
  { id: "space-06", slug: "sunset-residences", name: "Sunset Residences", badge: "DVS signature", gallery: ["space-06", "space-02", "space-01", "space-04"], startingPrice: "₹1,200" },
];

// Temporary design data and homepage images, pending the real project feed.
// Replace any generated record with a complete Project to customise every field.
export const projects: Project[] = sampleProjects.map((sample) => {
  const locationLabel = "Gurgaon (Sector 42)";
  const gallery = sample.gallery.map((id) => photos[id]);
  const description = `Discover ${sample.name} in ${locationLabel}. Explore the available spaces, compare layouts and amenities, and find the right fit for your needs with guidance from PropMentors.`;
  return {
    id: sample.id,
    slug: sample.slug,
    aliases: sample.aliases,
    name: sample.name,
    location: "gurgaon",
    locationLabel,
    type: "residential",
    category: "Residential",
    badge: sample.badge,
    price: 4900000,
    features: ["1,450 sq ft", "2 Baths", "3 BHK"],
    cover: photos[sample.id],
    detail: {
      description,
      overview: [["PROPERTY SIZE", "1,450 sq ft"], ["Space Type", "Residential"], ["Property Name", sample.name], ["Building", sample.name], ["Property ID", sample.id], ["Location", locationLabel]],
      building: [["Space Type", "Residential"], ["Built-up Area", "1,450 sq ft"], ["Floor", "Multiple floors"], ["Building Name", sample.name], ["Furnishing", "Fully furnished"], ["Availability", sample.badge === "sold out" ? "Sold out" : "Enquire for availability"], ["Parking", "Available"], ["Construction", "Completed"], ["Air Conditioning", "Centralised"]],
      amenities: ["24/7 Power Backup", "High Speed Wi-Fi", "Centrally Air Conditioned", "24/7 Security", "Meeting Rooms", "Visitor Parking", "Reception", "Lift & Accessibility"],
      gallery,
      spaces: gallery.slice(0, 3).map((image, index) => ({ id: `${sample.id}-option-${index + 1}`, title: `Space ${index + 1} · ${sample.name}`, location: locationLabel, description: "1,450 sq ft · Flexible options", badge: sample.badge, image })),
      location: {
        address: `Sector 42, Gurgaon`,
        caption: `${sample.name}\nSector 42, Gurgaon`,
        directionsQuery: `${sample.name}, Sector 42, Gurgaon`,
        map: { id: "location-map", src: "/project%20/Hero/a.png", alt: "Location map preview", width: 2940, height: 1912, cropWidth: 720, cropHeight: 430, cropTop: 0 },
        nearby: [["Neighbourhood", "Gurgaon"], ["Connectivity", "Golf Course Road"], ["Metro", "Nearby metro access"], ["Airport", "Delhi"], ["Address", "Sector 42, Gurgaon"], ["City", "Gurgaon, Haryana"]],
      },
      views: { interior: gallery[1], exterior: gallery[2] },
      startingPrice: sample.startingPrice,
      startingPriceUnit: "/ sq. ft.",
      highlights: ["Spaces to suit your needs", "Flexible options", "Expert guidance"],
      benefits: [
        { title: "Strategic Location", description: "A well-connected address with easy access to transport and business hubs." },
        { title: "Flexible Formats", description: "Compare the available spaces and layouts to find the right fit for your needs." },
        { title: "Ready for Business", description: "Essential amenities and practical spaces, with expert support at every step." },
      ],
      similarProjectIds: sampleProjects.filter(({ id }) => id !== sample.id).slice(0, 3).map(({ id }) => id),
    },
  };
});

export function getProject(slugOrId: string): Project | undefined {
  return projects.find((project) => project.slug === slugOrId || project.id === slugOrId || project.aliases?.includes(slugOrId));
}

export function projectHref(project: Pick<Project, "slug">): string {
  return `/projects/${project.slug}`;
}

export function formatProjectPrice(price: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(price)}`;
}

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
export type FinishedType = "Bare shell" | "Semi-Furnished" | "Ready-to-move";
export type WorkspaceOption = {
  id: string;
  title: string;
  location: string;
  description: string;
  badge: string;
  image: ProjectImage;
};

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
  price: number | null;
  features: string[];
  cover: ProjectImage;
  spaceType?: string;
  finishedTypes?: FinishedType[];
  amenities?: string[];
  detail: {
    description: string;
    overview: ProjectFact[];
    building: ProjectFact[];
    amenities: string[];
    gallery: ProjectImage[];
    spaces: WorkspaceOption[];
    location: { address: string; caption: string; directionsQuery: string; map: ProjectImage; nearby: ProjectFact[]; coordinates?: { lat: number; lng: number } };
    views: { floorPlan?: ProjectImage; interior: ProjectImage; exterior: ProjectImage };
    photoViewsOnly?: boolean;
    startingPrice: string;
    startingPriceUnit: string;
    highlights: string[];
    benefits: { title: string; description: string }[];
    similarProjectIds: string[];
  };
};

export function projectHref(project: Pick<Project, "slug">): string {
  return `/projects/${project.slug}`;
}

export function formatProjectPrice(price: number | null): string {
  if (price === null) return "Price on request";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(price)}`;
}

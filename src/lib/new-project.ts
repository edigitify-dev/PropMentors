import type { Project, ProjectImage } from "./project-types";
export function projectImage(src: string, name: string, index = 0): ProjectImage {
  return { id: `photo-${index}-${src.slice(-30)}`, src, alt: name, width: 1200, height: 780, cropWidth: 400, cropHeight: 260, cropTop: 0 };
}
export function newProject(id: string): Project {
  const image = projectImage("/images/spaces/property-placeholder.svg", "Property photograph");
  return {
    id, slug: "", name: "", location: "noida", locationLabel: "", type: "commercial", category: "Commercial", badge: "Enquire Now", price: null,
    spaceType: "Managed Office", finishedTypes: [], features: [], amenities: [], cover: image,
    detail: {
      description: "", overview: [], building: [], amenities: [], gallery: [], spaces: [],
      location: { address: "", caption: "", directionsQuery: "", map: image, nearby: [] },
      views: { interior: image, exterior: image }, photoViewsOnly: true, startingPrice: "Price on request", startingPriceUnit: "",
      highlights: [], benefits: [], similarProjectIds: [],
    },
  };
}

export type ProjectFilters = { spaceType: string; location: string; budget: string; query?: string };

export const spaceTypes = ["Coworking", "Managed Offices", "Conventional Leasing", "All space types"];
export const locations = ["Noida", "Gurgaon", "Delhi", "Bengaluru", "Mumbai", "All locations"];
export const budgets = ["30k - 80k", "80k - 1.5L", "1.5L - 3L", "3L+", "All budgets"];

export function resolveProjectFilters(initialFilters: Partial<ProjectFilters>): ProjectFilters {
  return {
    spaceType: spaceTypes.includes(initialFilters.spaceType ?? "") ? initialFilters.spaceType! : spaceTypes[0],
    location: locations.includes(initialFilters.location ?? "") ? initialFilters.location! : locations[0],
    budget: budgets.includes(initialFilters.budget ?? "") ? initialFilters.budget! : budgets[0],
    query: initialFilters.query?.trim() ?? "",
  };
}

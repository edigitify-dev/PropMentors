export type ProjectFilters = { spaceType: string; location: string; budget: string; query?: string };

export const spaceTypes = ["Coworking", "Commercial", "Conventional Leasing", "All space types"];
export const locations = ["Noida", "Gurgaon", "Delhi", "Bengaluru", "Mumbai", "All locations"];
export const budgets = ["30k - 80k", "80k - 1.5L", "1.5L - 3L", "3L+", "All budgets"];

export function resolveProjectFilters(initialFilters: Partial<ProjectFilters>): ProjectFilters {
  const matchType = spaceTypes.find(
    (t) =>
      initialFilters.spaceType &&
      (t.toLowerCase() === initialFilters.spaceType.toLowerCase() ||
        t.toLowerCase().replace(/[-\s]/g, "") === initialFilters.spaceType.toLowerCase().replace(/[-\s]/g, "") ||
        (t === "Commercial" && /managed\s*office/i.test(initialFilters.spaceType)))
  );

  return {
    spaceType: matchType ?? (initialFilters.spaceType && spaceTypes.includes(initialFilters.spaceType) ? initialFilters.spaceType : "All space types"),
    location: initialFilters.location && locations.includes(initialFilters.location) ? initialFilters.location : "All locations",
    budget: initialFilters.budget && budgets.includes(initialFilters.budget) ? initialFilters.budget : "All budgets",
    query: initialFilters.query?.trim() ?? "",
  };
}

import type { Project } from "./project-types";

// Existing database records keep their references and URLs while displaying the current wording.
export function currentProjectCopy(project: Project): Project {
  const references = new Set(["id", "slug", "aliases", "src", "similarProjectIds", "directionsQuery"]);
  function update(value: unknown, key = ""): unknown {
    if (references.has(key)) return value;
    if (typeof value === "string") {
      const managed = (word: string) => word === word.toUpperCase() ? "MANAGED" : word[0] === word[0].toUpperCase() ? "Managed" : "managed";
      return value.replace(/\bcommercial\b/gi, managed)
        .replace(/^manage$/gi, managed)
        .replace(/\bmanage\b(?=\s+(?:offices?|spaces?|propert(?:y|ies)|real|buildings?|destinations?|understanding|advisers?|teams?)\b)/gi, managed);
    }
    if (Array.isArray(value)) return value.map((item) => update(item));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, update(item, name)]));
    return value;
  }
  return update(project) as Project;
}

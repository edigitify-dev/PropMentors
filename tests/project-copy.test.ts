import assert from "node:assert/strict";
import { test } from "node:test";
import { currentProjectCopy } from "../src/lib/project-copy";
import { newProject } from "../src/lib/new-project";
import { emptyListingFilters, matchesListing, projectSpaceType } from "../src/lib/project-listing-filters";
import { resolveProjectFilters } from "../src/lib/space-search";

test("stored property copy uses Managed and preserves references and image URLs", () => {
  const project = newProject("commercial-office");
  project.slug = "commercial-office";
  project.aliases = ["commercial-studio"];
  project.category = "Commercial";
  project.spaceType = "Commercial";
  project.detail.description = "Commercial space for commercial teams. COMMERCIAL OFFICE.";
  project.detail.overview = [["Property type", "Commercial office space"]];
  project.cover.src = "https://images.example.test/commercial-office.jpg";
  project.cover.alt = "Commercial office";
  project.detail.similarProjectIds = ["commercial-neighbour"];
  const updated = currentProjectCopy(project);
  assert.equal(updated.category, "Managed");
  assert.equal(updated.spaceType, "Managed");
  assert.equal(updated.detail.description, "Managed space for managed teams. MANAGED OFFICE.");
  assert.deepEqual(updated.detail.overview, [["Property type", "Managed office space"]]);
  assert.equal(updated.cover.alt, "Managed office");
  assert.equal(updated.id, project.id);
  assert.equal(updated.slug, project.slug);
  assert.deepEqual(updated.aliases, project.aliases);
  assert.equal(updated.cover.src, project.cover.src);
  assert.deepEqual(updated.detail.similarProjectIds, project.detail.similarProjectIds);
  assert.equal(project.category, "Commercial");
});

test("previous Manage wording is updated while management verbs remain intact", () => {
  const project = newProject("manage-office");
  project.category = "Manage";
  project.spaceType = "Manage";
  project.detail.description = "Manage office space. Own or manage a manage property.";
  project.cover.alt = "MANAGE OFFICE";
  const updated = currentProjectCopy(project);
  assert.equal(updated.category, "Managed");
  assert.equal(updated.spaceType, "Managed");
  assert.equal(updated.detail.description, "Managed office space. Own or manage a managed property.");
  assert.equal(updated.cover.alt, "MANAGED OFFICE");
  assert.equal(updated.id, "manage-office");
});

test("Managed filters match both existing categories and renamed properties", () => {
  const project = newProject("office");
  for (const value of ["Commercial", "commercial", "Manage", "manage", "Managed", "Managed Office", "Managed Offices"]) {
    project.spaceType = value;
    assert.equal(projectSpaceType(project), "Managed", value);
    assert(matchesListing(project, { ...emptyListingFilters, spaceType: ["Managed"] }), value);
    assert.equal(resolveProjectFilters({ spaceType: value }).spaceType, "Managed", value);
  }
  project.spaceType = "Co-Working";
  assert(!matchesListing(project, { ...emptyListingFilters, spaceType: ["Managed"] }));
});

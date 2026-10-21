"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AdminProject, ProjectStatus } from "@/lib/admin-types";
import { AdminIcon } from "./admin-icons";
import { formatProjectPrice } from "@/lib/project-types";

export function ProjectsTable({ projects }: { projects: AdminProject[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [spaceType, setSpaceType] = useState("all");
  const [page, setPage] = useState(1);
  const types = [...new Set(projects.map(({ project }) => project.spaceType || project.category))].sort();
  const filtered = projects.filter((item) => (status === "all" || status === item.status) && (spaceType === "all" || (item.project.spaceType || item.project.category) === spaceType) && `${item.project.name} ${item.project.locationLabel} ${item.project.slug}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / 12);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const tabs: { label: string; value: typeof status }[] = [{ label: "All projects", value: "all" }, { label: "Published", value: "published" }, { label: "Drafts", value: "draft" }, { label: "Archived", value: "archived" }];
  return <>
    <div className="admin-page-heading"><div><span className="admin-eyebrow">A PORTFOLIO OF POSSIBILITIES</span><h1>Your projects<span className="admin-heading-dot">.</span></h1><p>Curate your spaces. Keep every detail considered.</p></div><Link href="/admin/projects/new" className="admin-button admin-button-primary"><AdminIcon name="plus" />Add a project</Link></div>
    <section className="admin-card admin-projects-card"><div className="admin-tabs" aria-label="Project status">{tabs.map((tab) => <button key={tab.value} className={status === tab.value ? "is-active" : ""} aria-pressed={status === tab.value} onClick={() => { setStatus(tab.value); setPage(1); }}>{tab.label}<span>{projects.filter((item) => tab.value === "all" || item.status === tab.value).length}</span></button>)}</div>
      <div className="admin-table-toolbar"><label className="admin-search"><AdminIcon name="search" /><input aria-label="Search projects" placeholder="Search by name or location…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />{search && <button aria-label="Clear search" onClick={() => { setSearch(""); setPage(1); }}><AdminIcon name="close" /></button>}</label><label className="admin-select-filter"><AdminIcon name="building" /><select aria-label="Filter by space type" value={spaceType} onChange={(e) => { setSpaceType(e.target.value); setPage(1); }}><option value="all">All space types</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label><span className="admin-results-count">{filtered.length} projects</span></div>
      <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Project</th><th>Space type</th><th>Starting price</th><th>Status</th><th>Last updated</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{filtered.slice((currentPage - 1) * 12, currentPage * 12).map(({ project, status, updatedAt }) => <tr key={project.id}><td><Link className="admin-project-cell" href={`/admin/projects/${encodeURIComponent(project.id)}`}><Image src={project.cover.src} alt="" width={62} height={52} unoptimized /><span><strong>{project.name}</strong><small><AdminIcon name="pin" />{project.locationLabel}</small></span></Link></td><td><span className="admin-table-type">{project.spaceType || project.category}</span></td><td className="admin-table-price">{formatProjectPrice(project.price)}</td><td><span className={`admin-status ${status}`}>{status}</span></td><td className="admin-table-date">{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(updatedAt))}</td><td><Link href={`/admin/projects/${encodeURIComponent(project.id)}`} className="admin-row-edit" aria-label={`Edit ${project.name}`}><AdminIcon name="draft" /></Link></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="admin-empty"><span><AdminIcon name="projects" /></span><h3>{projects.length ? "A little room to explore" : "Your portfolio starts here"}</h3><p>{projects.length ? "Try a different search or adjust your filters." : "Add your first space and bring its story to life."}</p>{projects.length ? <button className="admin-button admin-button-secondary" onClick={() => { setSearch(""); setStatus("all"); setSpaceType("all"); }}>Clear filters</button> : <Link href="/admin/projects/new" className="admin-button admin-button-primary">Add your first project</Link>}</div>}
      <div className="admin-table-footer"><span>{filtered.length ? `Showing ${(currentPage - 1) * 12 + 1}–${Math.min(currentPage * 12, filtered.length)} of ${filtered.length} projects` : "No projects to show"}</span><div><button className="admin-button admin-button-secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Previous</button><span>Page {currentPage} of {Math.max(1, totalPages)}</span><button className="admin-button admin-button-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next →</button></div></div>
    </section>
  </>;
}

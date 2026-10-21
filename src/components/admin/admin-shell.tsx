"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminIcon, type IconName } from "./admin-icons";
import type { AdminIdentity } from "@/lib/admin-types";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/projects", label: "Projects", icon: "projects" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "inbox" },
  { href: "/admin/contact", label: "Contact settings", icon: "settings" },
];
export function AdminShell({ admin, unread, children }: { admin: AdminIdentity; unread: number; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const section = links.find((link) => link.href === "/admin" ? path === link.href : path.startsWith(link.href));
  async function logout() {
    setLoggingOut(true); setError("");
    try {
      const response = await fetch("/api/admin/auth", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign out failed. Please try again.");
      router.replace("/admin/login"); router.refresh();
    } catch (error) { setError((error as Error).message); setLoggingOut(false); }
  }
  return <div className="admin-shell">
    {open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <Link href="/admin" className="admin-brand"><Image src="/images/propmentors-logo.svg" alt="" width={43} height={48} priority unoptimized /><span>PropMentors<small>ADMIN WORKSPACE</small></span></Link>
      <div className="admin-workspace"><span className="admin-workspace-icon"><AdminIcon name="building" /></span><div><strong>PropMentors</strong><small>Admin workspace</small></div><span className="admin-workspace-dot" /></div>
      <p className="admin-nav-label">WORKSPACE</p>
      <nav aria-label="Admin navigation">{links.map((link) => {
        const active = link.href === "/admin" ? path === link.href : path.startsWith(link.href);
        return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} onClick={() => setOpen(false)}><AdminIcon name={link.icon} /><span>{link.label}</span>{link.icon === "inbox" && unread > 0 && <b>{unread}</b>}</Link>;
      })}</nav>
      <div className="admin-sidebar-bottom">
      <div className="admin-user"><span className="admin-avatar">{admin.name.split(" ").map((name) => name[0]).slice(0, 2).join("").toUpperCase()}</span><div><strong>{admin.name}</strong><small>Administrator</small></div><button title="Sign out" aria-label="Sign out" disabled={loggingOut} onClick={logout}><AdminIcon name="logout" /></button></div>{error && <p role="alert" className="admin-sidebar-error">{error}</p>}</div>
    </aside>
    <div className="admin-main"><header className="admin-topbar"><div><button className="admin-menu-toggle" onClick={() => setOpen(!open)} aria-label="Open navigation" aria-expanded={open}><AdminIcon name="menu" /></button><span className="admin-breadcrumb-muted">Workspace</span><AdminIcon name="chevron" /><strong>{section?.label ?? "Workspace"}</strong></div><div><span className="admin-topbar-date">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date())}</span><Link href="/" target="_blank" rel="noopener noreferrer" className="admin-visit-link">View website <AdminIcon name="external" /></Link><Link href="/admin/enquiries" className="admin-notification" aria-label={`${unread} new enquiries`}><AdminIcon name="inbox" />{unread > 0 && <i />}</Link><span className="admin-avatar admin-avatar-small">{admin.name.charAt(0).toUpperCase()}</span></div></header>
      <main className="admin-content" id="admin-main-content">{children}</main><footer className="admin-workspace-footer"><span>© {new Date().getFullYear()} PropMentors</span><span><i /> Your workspace, thoughtfully connected.</span></footer>
    </div>
  </div>;
}

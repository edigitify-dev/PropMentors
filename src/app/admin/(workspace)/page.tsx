import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProjects, getEnquiries } from "@/lib/project-repository";
import { AdminIcon, type IconName } from "@/components/admin/admin-icons";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const [projects, enquiries] = await Promise.all([getAdminProjects(), getEnquiries()]);
  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const archived = projects.length - published - drafts;
  const unread = enquiries.filter((e) => e.status === "new").length;
  const stats: { label: string; value: number; icon: IconName; description: string; tone: string }[] = [
    { label: "Total projects", value: projects.length, icon: "projects", description: "Spaces in your portfolio", tone: "blue" },
    { label: "Published spaces", value: published, icon: "check", description: "Live and ready to discover", tone: "green" },
    { label: "Draft projects", value: drafts, icon: "draft", description: "Good things in the making", tone: "gold" },
    { label: "New enquiries", value: unread, icon: "inbox", description: "Conversations to start", tone: "violet" },
  ];
  const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
  const now = new Date().getTime();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now - (6 - i) * 86400000);
    return { label: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "Asia/Kolkata" }).format(date), count: enquiries.filter((e) => dayFormat.format(new Date(e.createdAt)) === dayFormat.format(date)).length };
  });
  const weekTotal = days.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...days.map((d) => d.count));
  return <>
    <div className="admin-page-heading"><div><span className="admin-eyebrow">YOUR WORKSPACE, IN FOCUS</span><h1>Portfolio overview<span className="admin-heading-dot">.</span></h1><p>Welcome back, {admin.name.split(" ")[0]}. Here’s what’s happening with your spaces.</p></div><Link href="/admin/projects/new" className="admin-button admin-button-primary"><AdminIcon name="plus" />Add a project</Link></div>
    <section className="admin-welcome"><div><span className="admin-welcome-tag"><i /> THE PROPMENTORS PORTFOLIO</span><h2>Great spaces deserve<br />a thoughtful approach.</h2><p>Keep your portfolio fresh and every conversation moving.</p><Link href="/admin/projects">Manage your projects <AdminIcon name="arrow" /></Link></div><div className="admin-welcome-image" aria-hidden="true"><span>SPACES WITH POSSIBILITY.</span></div><span className="admin-welcome-star" aria-hidden="true">✳</span></section>
    <div className="admin-stats">{stats.map((stat) => <div className="admin-stat" key={stat.label}><div><span>{stat.label}</span><span className={`admin-stat-icon ${stat.tone}`}><AdminIcon name={stat.icon} /></span></div><strong>{String(stat.value).padStart(2, "0")}</strong><p>{stat.description}</p></div>)}</div>
    <div className="admin-dashboard-charts"><section className="admin-card admin-activity-card"><div className="admin-card-heading"><div><h2>Enquiry activity</h2><p>New conversations over the last 7 days</p></div><span className="admin-soft-tag">Last 7 days</span></div><div className="admin-chart-summary"><strong>{weekTotal}</strong><span>{weekTotal === 1 ? "enquiry received" : "enquiries received"}</span></div><div className="admin-bar-chart" aria-label={`${weekTotal} enquiries in the past 7 days`}>{days.map((day, index) => <div key={index}><span className="admin-bar-value">{day.count}</span><div className="admin-bar-track"><div className={index === 6 ? "is-today" : ""} style={{ height: `${day.count ? Math.max(6, day.count / max * 100) : 2}%` }} /></div><span>{day.label}</span></div>)}</div></section>
      <section className="admin-card admin-portfolio-card"><div className="admin-card-heading"><div><h2>Portfolio health</h2><p>A little perspective on your spaces</p></div><AdminIcon name="projects" /></div><div className="admin-donut" style={{ background: projects.length ? `conic-gradient(#122c4f 0 ${published / projects.length * 100}%, #5d87b5 ${published / projects.length * 100}% ${(published + drafts) / projects.length * 100}%, #dfe4e9 ${(published + drafts) / projects.length * 100}% 100%)` : "#e8ecef" }}><div><strong>{projects.length}</strong><span>Total projects</span></div></div><div className="admin-chart-legend"><span><i className="green" />Published<strong>{published}</strong></span><span><i className="gold" />Draft<strong>{drafts}</strong></span><span><i className="grey" />Hidden<strong>{archived}</strong></span></div></section>
    </div>
    <div className="admin-dashboard-lower"><section className="admin-card"><div className="admin-card-heading"><div><h2>Recently updated</h2><p>The latest in your portfolio</p></div><Link href="/admin/projects" className="admin-text-link">All projects <AdminIcon name="arrow" /></Link></div><div className="admin-recent-projects">{projects.slice(0, 5).map(({ project, status }) => <Link key={project.id} href={`/admin/projects/${encodeURIComponent(project.id)}`}><Image src={project.cover.src} alt="" width={54} height={48} unoptimized /><div><strong>{project.name}</strong><span>{project.locationLabel}</span></div><span className={`admin-status ${status}`}>{status === "archived" ? "Hidden" : status}</span><AdminIcon name="chevron" /></Link>)}{!projects.length && <div className="admin-inline-empty">Your portfolio starts with your first project.</div>}</div></section>
      <section className="admin-card"><div className="admin-card-heading"><div><h2>Latest enquiries</h2><p>Every conversation is a possibility</p></div><Link href="/admin/enquiries" aria-label="View all enquiries" className="admin-icon-button"><AdminIcon name="arrow" /></Link></div><div className="admin-recent-enquiries">{enquiries.slice(0, 4).map((e) => <Link key={e.id} href={`/admin/enquiries?selected=${e.id}`}><span className="admin-enquiry-avatar">{e.name.charAt(0).toUpperCase()}</span><div><strong>{e.name}</strong><p>{e.subject}</p><small>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(e.createdAt))}</small></div>{e.status === "new" && <i />}</Link>)}{!enquiries.length && <div className="admin-empty admin-empty-compact"><span><AdminIcon name="inbox" /></span><h3>Room for new conversations</h3><p>Enquiries from your website will arrive here.</p><Link href="/contact" target="_blank" rel="noopener noreferrer" className="admin-text-link">View your contact page <AdminIcon name="external" /></Link></div>}</div></section></div>
  </>;
}

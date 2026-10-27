import type { CSSProperties, ReactNode } from "react";

function Bone({ width = "100%", height = 12, className = "" }: {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  className?: string;
}) {
  return <span className={`admin-skeleton-bone ${className}`} style={{ width, height }} />;
}

function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return <div className="admin-loading">
    <span role="status" className="admin-sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>;
}

function Heading() {
  return <div className="admin-page-heading">
    <div className="admin-skeleton-heading"><Bone width="46%" height={8} /><Bone width="72%" height={32} /><Bone height={10} /></div>
    <Bone width={140} height={39} />
  </div>;
}

function Lines() {
  return <div className="admin-skeleton-stack"><Bone /><Bone width="82%" /><Bone width="58%" /></div>;
}

function Tabs() {
  return <div className="admin-skeleton-tabs">{Array.from({ length: 4 }, (_, i) => <Bone key={i} width={85} height={14} />)}</div>;
}

function Field({ tall = false }: { tall?: boolean }) {
  return <div className="admin-skeleton-stack"><Bone width={95} height={10} /><Bone height={tall ? 110 : 42} /></div>;
}

function FormCard({ children }: { children: ReactNode }) {
  return <div className="admin-card admin-form-card admin-skeleton-stack">
    <Bone width="55%" height={18} /><Bone width="80%" height={10} />{children}
  </div>;
}

function SaveBar() {
  return <div className="admin-save-bar"><Bone width="35%" height={10} /><Bone width={125} height={39} /></div>;
}

function RecentRows() {
  return <div className="admin-skeleton-stack">{Array.from({ length: 4 }, (_, i) => <div className="admin-skeleton-row" key={i}>
    <Bone width={48} height={44} /><div className="admin-skeleton-grow"><Lines /></div><Bone width={60} height={22} />
  </div>)}</div>;
}

function DashboardContent() {
  return <>
    <Heading />
    <div className="admin-skeleton-banner"><Bone height="100%" /></div>
    <div className="admin-stats">{Array.from({ length: 4 }, (_, i) => <div className="admin-stat admin-skeleton-stack" key={i}>
      <div><Bone width="58%" height={10} /><Bone width={31} height={31} /></div>
      <Bone width={54} height={34} /><Bone width="78%" height={8} />
    </div>)}</div>
    <div className="admin-dashboard-charts">
      <div className="admin-card admin-skeleton-card"><Bone width="45%" height={18} /><Bone width="65%" height={10} />
        <div className="admin-skeleton-chart">{[42, 70, 55, 90, 65, 80, 100].map((height, i) => <Bone key={i} width="10%" height={`${height}%`} />)}</div>
      </div>
      <div className="admin-card admin-skeleton-card"><Bone width="55%" height={18} /><Bone width="80%" height={10} /><div className="admin-skeleton-donut"><Bone width={150} height={150} className="admin-skeleton-circle" /></div></div>
    </div>
    <div className="admin-dashboard-lower">{[0, 1].map((i) => <div key={i} className="admin-card admin-skeleton-card"><Bone width="50%" height={18} /><RecentRows /></div>)}</div>
  </>;
}

export function DashboardSkeleton() {
  return <LoadingRegion label="Loading portfolio overview…"><DashboardContent /></LoadingRegion>;
}

// This ancestor fallback also covers authentication and data loaded by WorkspaceLayout.
export function AdminWorkspaceSkeleton() {
  return <LoadingRegion label="Loading admin workspace…">
    <div className="admin-shell">
      <aside className="admin-sidebar admin-skeleton-sidebar">
        <Bone width="80%" height={40} /><Bone height={58} />
        <div className="admin-skeleton-stack">{[0, 1, 2, 3].map((i) => <Bone key={i} height={39} />)}</div>
        <div className="admin-sidebar-bottom"><Bone height={45} /></div>
      </aside>
      <div className="admin-main"><div className="admin-topbar"><Bone width={180} height={12} /><Bone width={95} height={31} /></div>
        <div className="admin-content"><DashboardContent /></div>
      </div>
    </div>
  </LoadingRegion>;
}

export function ProjectsSkeleton() {
  return <LoadingRegion label="Loading projects…">
    <Heading />
    <div className="admin-card admin-projects-card"><Tabs />
      <div className="admin-table-toolbar"><Bone width="48%" height={39} /><Bone width={150} height={39} /></div>
      <div className="admin-table-scroll"><div className="admin-skeleton-table">
        <div className="admin-skeleton-table-row">{[0, 1, 2, 3, 4].map((i) => <Bone key={i} width="65%" height={10} />)}</div>
        {Array.from({ length: 6 }, (_, i) => <div className="admin-skeleton-table-row" key={i}>
          <div className="admin-skeleton-row"><Bone width={62} height={52} /><div className="admin-skeleton-grow"><Lines /></div></div>
          <Bone width="80%" /><Bone width="70%" /><Bone width={65} height={22} /><Bone width="75%" />
        </div>)}
      </div></div>
      <div className="admin-table-footer"><Bone width={160} height={10} /><Bone width={210} height={32} /></div>
    </div>
  </LoadingRegion>;
}

export function ProjectEditorSkeleton() {
  return <LoadingRegion label="Loading project editor…">
    <div className="admin-back-link"><Bone width={110} height={10} /></div><Heading />
    <div className="admin-editor-layout">
      <div className="admin-form-stack"><div className="admin-card admin-editor-card"><Tabs />
        <div className="admin-editor-panel admin-skeleton-stack"><Bone width="50%" height={18} /><Bone width="75%" height={10} />
          <Field /><Field /><div className="admin-form-grid"><Field /><Field /></div><div className="admin-form-grid"><Field /><Field /></div><Field tall />
        </div>
      </div><SaveBar /></div>
      <div className="admin-editor-aside"><FormCard><Field /><Lines /></FormCard>
        <div className="admin-card admin-skeleton-card"><Bone width="60%" height={16} /><Bone height={167} /><Lines /></div>
      </div>
    </div>
  </LoadingRegion>;
}

export function ContactSkeleton() {
  return <LoadingRegion label="Loading contact settings…">
    <Heading />
    <div className="admin-contact-layout"><div className="admin-form-stack">
      <FormCard><div className="admin-form-grid"><Field /><Field /></div><Field tall /></FormCard>
      <FormCard><Field /><Field tall /></FormCard><SaveBar />
    </div><div className="admin-skeleton-stack"><Bone width="60%" height={10} />
      <div className="admin-card admin-skeleton-card"><Bone width="70%" height={55} /><Lines /><Field /><Field /><Field tall /></div>
    </div></div>
  </LoadingRegion>;
}

export function EnquiriesSkeleton() {
  return <LoadingRegion label="Loading enquiries…">
    <Heading />
    <div className="admin-card"><Tabs /><div className="admin-inbox">
      <div className="admin-inbox-list"><div className="admin-skeleton-card"><Bone height={39} /></div>
        <div className="admin-inbox-scroll">{Array.from({ length: 6 }, (_, i) => <div className="admin-inbox-item" key={i}><Bone width={33} height={33} className="admin-skeleton-circle" /><div className="admin-skeleton-grow"><Lines /></div></div>)}</div>
      </div>
      <div className="admin-enquiry-detail admin-skeleton-stack"><div className="admin-skeleton-row"><Bone width={65} height={22} /><Bone width={130} height={10} /></div>
        <Bone width="70%" height={26} /><div className="admin-skeleton-row"><Bone width={40} height={40} className="admin-skeleton-circle" /><div className="admin-skeleton-grow"><Lines /></div></div>
        <Bone height={45} /><Bone height={130} /><Bone width="65%" height={16} /><Field /><Field tall /><SaveBar />
      </div>
    </div></div>
  </LoadingRegion>;
}

export function AuthSkeleton({ setup = false }: { setup?: boolean }) {
  return <LoadingRegion label={setup ? "Loading admin setup…" : "Loading admin sign in…"}>
    <div className="admin-auth"><div className="admin-auth-art admin-skeleton-auth-art"><Bone width="55%" height={35} />
      <div className="admin-skeleton-stack"><Bone width="70%" height={90} /><Bone width="85%" /><Bone width="60%" /></div><Bone width="65%" height={10} />
    </div><div className="admin-auth-panel"><div className="admin-auth-back"><Bone width={90} height={10} /></div>
      <div className="admin-auth-form-wrap admin-skeleton-stack"><Bone width={44} height={44} /><Bone width="70%" height={8} /><Bone width="80%" height={30} /><Bone height={10} />
        {setup && <Field />}<Field /><Field />{setup && <Field />}<Bone height={44} /><Bone width="75%" height={10} />
      </div><Bone width="55%" height={8} />
    </div></div>
  </LoadingRegion>;
}

export type IconName = "overview" | "projects" | "inbox" | "settings" | "arrow" | "plus" | "search" | "external" | "logout" | "chevron" | "building" | "check" | "draft" | "close" | "upload" | "photo" | "pin" | "mail" | "phone" | "menu" | "shield" | "clock" | "trash";
const paths: Record<IconName, React.ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  projects: <><path d="M4 21V5a2 2 0 0 1 2-2h9v18M15 9h5v12M2 21h20M8 7h3M8 11h3M8 15h3M8 21v-3h3v3" /></>,
  inbox: <><path d="M4 4h16l2 11v5H2v-5L4 4ZM2 15h6l2 3h4l2-3h6M8 8h8M9 11h6" /></>,
  settings: <><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3H9Z" /><circle cx="12" cy="12" r="3" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  external: <><path d="M14 3h7v7M21 3 10 14M10 3H4v17h17v-6" /></>,
  logout: <path d="M10 3H4v18h6M9 12h12m-5-5 5 5-5 5" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  building: <><path d="M3 21V8l9-5 9 5v13H3ZM8 21v-6h8v6M7 10h.01M12 10h.01M17 10h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  draft: <><path d="M13 3H4v18h16v-9M11 13l1-4 7-7 3 3-7 7-4 1Z" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  upload: <path d="M12 16V3m-5 5 5-5 5 5M3 15v6h18v-6" />,
  photo: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  phone: <path d="m4 3 5 1 1 5-3 2a15 15 0 0 0 6 6l2-3 5 1 1 5c-9 4-21-8-17-17Z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  shield: <><path d="m12 3 8 3v6c0 6-8 10-8 10S4 18 4 12V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />,
};
export function AdminIcon({ name, className }: { name: IconName; className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

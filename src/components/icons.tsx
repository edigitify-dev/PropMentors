import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function Search(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
export function Menu(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
}
export function AccountCircle(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22Z" /></svg>;
}
export function ArrowUp(props: IconProps) {
  return <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M12 19V5m-7 7 7-7 7 7" /></svg>;
}
export function ChevronLeft(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m15 18-6-6 6-6" /></svg>;
}
export function ChevronRight(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m9 18 6-6-6-6" /></svg>;
}
export function PlayCircle(props: IconProps) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4V8Z" /></svg>;
}

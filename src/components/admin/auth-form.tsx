"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./admin-icons";

export function AuthForm({ setup = false }: { setup?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(`/api/admin/auth${setup ? "?setup=true" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Couldn’t connect. Please try again."); setPending(false); }
  }
  return <div className="admin-auth"><div className="admin-auth-art"><Link href="/" className="admin-auth-wordmark">PropMentors<span>ADMIN WORKSPACE</span></Link><div><span className="admin-eyebrow">THOUGHTFULLY CONNECTED</span><h1>Exceptional spaces.<br /><em>Effortless management.</em></h1><p>A considered workspace for your portfolio,<br />your conversations, and what comes next.</p></div><small>Built for the people behind the possibilities.</small></div>
    <div className="admin-auth-panel"><Link href="/" className="admin-auth-back">← Back to website</Link><div className="admin-auth-form-wrap"><span className="admin-auth-symbol"><AdminIcon name="shield" /></span><span className="admin-eyebrow">PROPMENTORS MANAGEMENT SUITE</span><h2>{setup ? "Make yourself at home." : "Welcome back."}</h2><p>{setup ? "Create the first administrator for your workspace." : "Sign in to look after your spaces and conversations."}</p>
      <form onSubmit={submit} className="admin-form">
        {setup && <label>Full name<input name="name" autoComplete="name" required maxLength={120} placeholder="Your full name" /></label>}
        <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@propmentors.com" /></label>
        <label>Password<input name="password" type="password" autoComplete={setup ? "new-password" : "current-password"} required minLength={setup ? 12 : 1} maxLength={256} placeholder={setup ? "At least 12 characters" : "Enter your password"} /></label>
        {setup && <label>Setup key<input name="setupKey" type="password" autoComplete="off" required placeholder="Key from your local environment file" /><small>Use ADMIN_SETUP_TOKEN from .env.local. Setup closes after the first account is created.</small></label>}
        {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}
        <button className="admin-button admin-button-primary" disabled={pending}>{pending ? "Please wait…" : setup ? "Create admin account" : "Sign in to workspace"}<AdminIcon name="arrow" /></button>
      </form><div className="admin-auth-secure"><AdminIcon name="shield" /><span>Private access. A space for your team.</span></div>
    </div><p className="admin-auth-copyright">© {new Date().getFullYear()} PropMentors. All rights reserved.</p></div>
  </div>;
}

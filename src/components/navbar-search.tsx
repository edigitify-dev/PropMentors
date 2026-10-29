"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Project } from "@/lib/project-types";
import { Search } from "./icons";
import styles from "./navbar-search.module.css";

type Suggestion = Pick<Project, "id" | "slug" | "name" | "locationLabel">;

export function NavbarSearch({ className, onSubmit }: { className: string; onSubmit?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const id = useId();
  const showSuggestions = expanded && focused && query.trim().length >= 2;
  const resultsHref = `/projects?query=${encodeURIComponent(query.trim())}#project-listings`;

  useEffect(() => {
    if (!expanded || query.trim().length < 2) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/search?query=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data: { suggestions: Suggestion[] } = await response.json();
        if (!controller.signal.aborted) setSuggestions(data.suggestions);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [expanded, query]);

  function closeSearch() {
    setExpanded(false);
    setFocused(false);
    setActiveIndex(-1);
    window.requestAnimationFrame(() => trigger.current?.focus());
  }

  function suggestionHref(item: Suggestion) {
    return `/projects/${item.slug}?returnTo=${encodeURIComponent(resultsHref)}`;
  }

  function selectSuggestion() {
    setFocused(false);
    onSubmit?.();
  }

  return <div className={styles.search} data-navbar-search={expanded ? "open" : "closed"} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false);
      setActiveIndex(-1);
      if (!query.trim()) setExpanded(false);
    }
  }}>
    {!expanded ? <button ref={trigger} type="button" className={className} aria-label="Search spaces" aria-expanded={false} onClick={() => {
      const currentQuery = new URLSearchParams(window.location.search).get("query") ?? "";
      setQuery(currentQuery);
      setSuggestions([]);
      setLoading(currentQuery.trim().length >= 2);
      setFailed(false);
      setExpanded(true);
    }}><Search /></button> : <>
      <Form action="/projects#project-listings" className={styles.field} role="search" onSubmit={selectSuggestion}>
        <button type="submit" className={styles.icon} aria-label="Search spaces"><Search /></button>
        <input type="search" name="query" value={query} placeholder="Search spaces…" maxLength={160} aria-label="Search building, location or sector" role="combobox" aria-autocomplete="list" aria-expanded={showSuggestions} aria-controls={`${id}-results`} aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} autoComplete="off" enterKeyHint="search" autoFocus onFocus={() => setFocused(true)} onChange={(event) => {
          setQuery(event.target.value);
          setSuggestions([]);
          setActiveIndex(-1);
          setLoading(event.target.value.trim().length >= 2);
          setFailed(false);
          setFocused(true);
        }} onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length) {
            event.preventDefault();
            setFocused(true);
            setActiveIndex((current) => event.key === "ArrowDown" ? (current + 1) % suggestions.length : (current <= 0 ? suggestions.length : current) - 1);
          }
          if (event.key === "Enter" && showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
            event.preventDefault();
            router.push(suggestionHref(suggestions[activeIndex]));
            selectSuggestion();
          }
        }} />
        <button type="button" className={styles.icon} aria-label="Close search" onClick={closeSearch}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      </Form>
      {showSuggestions && <div className={styles.dropdown}>
        {loading ? <p className={styles.status} role="status">Searching spaces…</p> : failed ? <p className={styles.status} role="status">Suggestions unavailable. Press Enter to search.</p> : !suggestions.length && <p className={styles.status} role="status">No matching spaces. Try another building or location.</p>}
        <div id={`${id}-results`} role="listbox" aria-label="Suggested spaces" aria-busy={loading}>
          {suggestions.map((item, index) => <Link key={item.id} id={`${id}-option-${index}`} href={suggestionHref(item)} className={styles.suggestion} role="option" aria-selected={activeIndex === index} tabIndex={-1} onMouseDown={(event) => event.preventDefault()} onClick={selectSuggestion}>
            <span>{item.name}</span><small>{item.locationLabel}</small>
          </Link>)}
        </div>
        <Link href={resultsHref} className={styles.allResults} onClick={selectSuggestion}>View all results <Search /></Link>
      </div>}
    </>}
  </div>;
}

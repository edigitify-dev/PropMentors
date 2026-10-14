"use client";

import { useState } from "react";

export function ClientLogoMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="glance-client-logos" data-paused={paused}>
      <div className="glance-client-logos-window">
        <div className="glance-client-logos-track">
          {[0, 1].map((copy) => (
            <div className="glance-client-logos-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              <div
                className="glance-client-logos-art"
                role={copy === 0 ? "img" : undefined}
                aria-label={copy === 0 ? "Client logos including ContraVault AI, Spyne, Kris@Work, TOCAL, Bharat Tender and Milo Drive" : undefined}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="glance-marquee-toggle"
        aria-label={paused ? "Play client logo animation" : "Pause client logo animation"}
        onClick={() => setPaused(!paused)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M3 1.5 10 6l-7 4.5z" /> : <path d="M2.5 2h2v8h-2zm5 0h2v8h-2z" />}
        </svg>
      </button>
    </div>
  );
}

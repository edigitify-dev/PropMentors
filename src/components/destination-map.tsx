"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { businessDestinations } from "../data/business-destinations";
import styles from "./destination-map.module.css";

function highlightMarkers(markers: Marker[], active: number | null) {
  markers.forEach((marker, index) => {
    const element = marker.getElement();
    element?.setAttribute("data-active", String(active === index));
    element?.setAttribute("aria-pressed", String(active === index));
    element?.setAttribute("aria-expanded", String(active === index));
    marker.setZIndexOffset(active === index ? 1000 : 0);
  });
}

export function DestinationMap({ active, onSelect, children }: { active: number | null; onSelect: (index: number | null) => void; children: ReactNode }) {
  const previewId = useId();
  const container = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const tiles = useRef<TileLayer | null>(null);
  const markers = useRef<Marker[]>([]);
  const selected = useRef(active);
  const resetView = useRef<(() => void) | null>(null);
  const positionPreview = useRef<((keepVisible: boolean) => void) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    selected.current = active;
    highlightMarkers(markers.current, active);
    positionPreview.current?.(true);
  }, [active]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false;
    let resize: ResizeObserver | undefined;
    let previewResize: ResizeObserver | undefined;
    let hasLoadedTile = false;

    async function initialise(element: HTMLDivElement) {
      try {
        const L = await import("leaflet");
        if (disposed) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const instance = L.map(element, {
          scrollWheelZoom: false,
          zoomControl: false,
          zoomSnap: .25,
          minZoom: 7,
          maxZoom: 18,
          fadeAnimation: !reducedMotion,
          zoomAnimation: !reducedMotion,
          markerZoomAnimation: !reducedMotion,
        });
        map.current = instance;
        const placePreview = (keepVisible: boolean) => {
          const index = selected.current;
          const card = preview.current;
          if (index === null || !card) return;
          const city = businessDestinations[index];
          let point = instance.latLngToContainerPoint([city.latitude, city.longitude]);
          if (keepVisible) {
            const size = instance.getSize();
            const left = point.x - card.offsetWidth / 2;
            const top = point.y + 58;
            const dx = left < 16 ? left - 16 : Math.max(0, left + card.offsetWidth - size.x + 16);
            const targetTop = Math.max(80, Math.min(top, size.y - card.offsetHeight - 32));
            const dy = top - targetTop;
            if (dx || dy) {
              instance.panBy([dx, dy], { animate: false });
              point = instance.latLngToContainerPoint([city.latitude, city.longitude]);
            }
          }
          card.style.left = `${point.x}px`;
          card.style.top = `${point.y + 58}px`;
          card.style.visibility = "visible";
        };
        positionPreview.current = placePreview;
        instance.on("move zoomend", () => placePreview(false));
        instance.on("click", () => onSelect(null));
        L.control.zoom({ position: "topright" }).addTo(instance);
        const bounds = L.latLngBounds(businessDestinations.map((city) => [city.latitude, city.longitude]));
        const fitDestinations = () => {
          instance.invalidateSize({ pan: false });
          instance.fitBounds(bounds, { paddingTopLeft: [64, 90], paddingBottomRight: [64, 70], animate: false });
          placePreview(true);
        };
        resetView.current = fitDestinations;
        fitDestinations();
        const layer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
          keepBuffer: 0,
        });
        tiles.current = layer;
        layer.on("tileload", () => { hasLoadedTile = true; setStatus("ready"); });
        layer.on("load", () => { if (!hasLoadedTile) setStatus("error"); });
        layer.addTo(instance);
        markers.current = businessDestinations.map((city, index) => {
          const marker = L.marker([city.latitude, city.longitude], {
            title: `Explore ${city.name}`,
            alt: `Explore ${city.name}`,
            keyboard: true,
            autoPanOnFocus: false,
            icon: L.divIcon({
              className: styles.marker,
              html: `<span class="${styles.markerRing}" aria-hidden="true"></span><span class="${styles.markerDot}" aria-hidden="true"></span><span class="${styles.markerLabel}">${city.name}</span>`,
              iconSize: [44, 44],
              iconAnchor: [22, 22],
            }),
          }).addTo(instance);
          const markerElement = marker.getElement();
          markerElement?.setAttribute("aria-label", `Explore ${city.name}`);
          markerElement?.setAttribute("aria-pressed", String(selected.current === index));
          markerElement?.setAttribute("aria-controls", previewId);
          // DivIcon markers need explicit button keyboard activation.
          markerElement?.addEventListener("keydown", (event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              onSelect(index);
            }
          });
          marker.on("click", () => onSelect(index));
          return marker;
        });
        highlightMarkers(markers.current, selected.current);
        placePreview(true);
        resize = new ResizeObserver(fitDestinations);
        resize.observe(element);
        previewResize = new ResizeObserver(() => placePreview(true));
        if (preview.current) previewResize.observe(preview.current);
      } catch {
        if (!disposed) setStatus("error");
      }
    }

    // Fetch visible map tiles only when this section enters the viewport.
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      visibility.disconnect();
      void initialise(element);
    });
    visibility.observe(element);
    return () => {
      disposed = true;
      visibility.disconnect();
      resize?.disconnect();
      previewResize?.disconnect();
      tiles.current?.off();
      map.current?.remove();
      map.current = null;
      tiles.current = null;
      markers.current = [];
      resetView.current = null;
      positionPreview.current = null;
    };
  }, [onSelect, previewId]);

  return <div className={styles.mapShell} onKeyDown={(event) => {
    if (event.key === "Escape" && active !== null) {
      event.preventDefault();
      markers.current[active]?.getElement()?.focus({ preventScroll: true });
      onSelect(null);
    }
  }}>
    <div className={styles.canvas} ref={container} role="region" aria-label="Interactive map of Delhi, Gurugram, Noida and Greater Noida" />
    <div ref={preview} id={previewId} className={styles.preview} hidden={active === null} role="region" aria-label={active === null ? "City preview" : `Spaces in ${businessDestinations[active].name}`}>
      {active !== null && <><div className={styles.previewHeader}><span>{businessDestinations[active].name}</span><button type="button" aria-label="Close city preview" onClick={() => {
        markers.current[active]?.getElement()?.focus({ preventScroll: true });
        onSelect(null);
      }}>×</button></div>{children}</>}
    </div>
    <button type="button" className={styles.reset} onClick={() => { onSelect(null); resetView.current?.(); }} aria-label="Show all four cities">Show all cities</button>
    {status !== "ready" && <div className={styles.status} role="status">
      {status === "loading" ? "Loading map…" : <>Map couldn’t load. Check your connection.<button type="button" onClick={() => {
        if (tiles.current) { setStatus("loading"); tiles.current.redraw(); }
        else window.location.reload();
      }}>Retry map</button></>}
    </div>}
  </div>;
}

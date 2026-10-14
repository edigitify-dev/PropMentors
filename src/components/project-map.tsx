"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Project, projects } from "../data/projects";
import styles from "./project-map.module.css";

interface ProjectMapProps {
  project: Project;
}

export function ProjectMap({ project }: ProjectMapProps) {
  const coordinates = project.detail.location.coordinates;
  if (coordinates) return <CoordinateProjectMap project={project} coords={coordinates} />;

  const query = encodeURIComponent(project.detail.location.directionsQuery);

  return (
    <div className={styles.mapWrapper}>
      <iframe
        className={styles.mapEmbed}
        title={`Location map for ${project.name}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className={styles.mapFloatingBar}>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.floatingBtn}
        >
          Open in Google Maps &rarr;
        </a>
      </div>
    </div>
  );
}

function CoordinateProjectMap({ project, coords }: ProjectMapProps & { coords: { lat: number; lng: number } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const mainMarkerRef = useRef<Marker | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [showNearby, setShowNearby] = useState(true);
  const nearbyMarkersRef = useRef<Marker[]>([]);

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    project.detail.location.directionsQuery
  )}`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let hasLoadedTile = false;

    async function initMap(container: HTMLDivElement) {
      try {
        const L = await import("leaflet");
        if (disposed) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Initialize map instance centered on current project
        const instance = L.map(container, {
          center: [coords.lat, coords.lng],
          zoom: 15,
          scrollWheelZoom: false,
          zoomControl: false,
          minZoom: 11,
          maxZoom: 18,
          fadeAnimation: !prefersReducedMotion,
          zoomAnimation: !prefersReducedMotion,
          markerZoomAnimation: !prefersReducedMotion,
        });

        mapRef.current = instance;

        // Add Zoom Control to top-right
        L.control.zoom({ position: "topright" }).addTo(instance);

        // OpenStreetMap tile layer with attribution
        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
          keepBuffer: 1,
        });

        tileLayerRef.current = tiles;
        tiles.on("tileload", () => {
          hasLoadedTile = true;
          setStatus("ready");
        });
        tiles.on("load", () => {
          if (!hasLoadedTile) setStatus("error");
        });
        tiles.addTo(instance);

        // Create main project marker with custom SVG Pin + pulse aura + name badge
        const pinSvg = `
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#122C4F"/>
            <circle cx="17" cy="17" r="13" fill="#FCF7E4"/>
            <path d="M12 21V12H22V21" stroke="#122C4F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 21H24" stroke="#122C4F" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M15 15H19" stroke="#5D87B5" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M15 18H19" stroke="#5D87B5" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        `;

        const mainIcon = L.divIcon({
          className: styles.mainMarker,
          html: `
            <div class="${styles.mainMarkerPulse}"></div>
            <div class="${styles.mainMarkerPin}">
              ${pinSvg}
            </div>
            <div class="${styles.mainMarkerLabel}">
              <span class="${styles.mainMarkerDot}"></span>
              <span>${project.name}</span>
            </div>
          `,
          iconSize: [44, 52],
          iconAnchor: [22, 44],
          popupAnchor: [0, -46],
        });

        const mainMarker = L.marker([coords.lat, coords.lng], {
          icon: mainIcon,
          title: project.name,
          zIndexOffset: 1000,
        }).addTo(instance);

        mainMarkerRef.current = mainMarker;

        // Popup content for the primary project
        const popupHtml = `
          <div class="${styles.popupCard}">
            <span class="${styles.popupBadge}">${project.badge || project.locationLabel}</span>
            <h3 class="${styles.popupTitle}">${project.name}</h3>
            <p class="${styles.popupAddress}">${project.detail.location.address}</p>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="${styles.popupDirections}">
              Directions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        `;

        mainMarker.bindPopup(popupHtml, {
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
        });

        mainMarker.on("click", () => {
          mainMarker.openPopup();
        });

        // Add other nearby project pointers on the corridor for rich geographical context
        const otherProjects = projects.filter(
          (p) => p.id !== project.id && p.detail.location.coordinates
        );

        nearbyMarkersRef.current = otherProjects.map((p) => {
          const pCoords = p.detail.location.coordinates!;
          const nearbyIcon = L.divIcon({
            className: styles.nearbyMarker,
            html: `<div class="${styles.nearbyMarkerDot}" title="${p.name}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -10],
          });

          const marker = L.marker([pCoords.lat, pCoords.lng], {
            icon: nearbyIcon,
            title: p.name,
            zIndexOffset: 100,
          }).addTo(instance);

          const nearbyPopupHtml = `
            <div class="${styles.popupCard}">
              <span class="${styles.popupBadge}">${p.locationLabel}</span>
              <h3 class="${styles.popupTitle}">${p.name}</h3>
              <p class="${styles.popupAddress}">${p.detail.location.address}</p>
              <a href="/projects/${p.slug}" class="${styles.popupDirections}">
                View Project &rarr;
              </a>
            </div>
          `;

          marker.bindPopup(nearbyPopupHtml, {
            closeButton: true,
            autoPan: true,
            autoPanPadding: [20, 20],
          });

          marker.on("click", () => {
            marker.openPopup();
          });

          return marker;
        });

        // Keep map responsive with ResizeObserver
        resizeObserver = new ResizeObserver(() => {
          instance.invalidateSize({ pan: false });
        });
        resizeObserver.observe(container);

        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    }

    // Lazy load when section comes into view
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void initMap(element);
    });

    observer.observe(element);

    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver?.disconnect();
      tileLayerRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      nearbyMarkersRef.current = [];
    };
  }, [coords.lat, coords.lng, directionsUrl, project]);

  // Handle toggling of nearby corporate markers
  useEffect(() => {
    if (!mapRef.current) return;
    nearbyMarkersRef.current.forEach((marker) => {
      if (showNearby) {
        if (!mapRef.current?.hasLayer(marker)) {
          marker.addTo(mapRef.current!);
        }
      } else {
        if (mapRef.current?.hasLayer(marker)) {
          mapRef.current.removeLayer(marker);
        }
      }
    });
  }, [showNearby]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([coords.lat, coords.lng], 15, {
      duration: 1.2,
    });
    mainMarkerRef.current?.openPopup();
  };

  return (
    <div className={styles.mapWrapper}>
      {/* Map Canvas */}
      <div
        ref={containerRef}
        className={styles.mapCanvas}
        role="region"
        aria-label={`Interactive map showing location of ${project.name}`}
      />

      {/* Top Left Live GPS Badge */}
      <div className={styles.badgeCoords}>
        <span className={styles.liveIndicator} />
        <span>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</span>
      </div>

      {/* Floating Map Actions */}
      <div className={styles.mapFloatingBar}>
        <button
          type="button"
          className={styles.floatingBtn}
          onClick={handleRecenter}
          aria-label={`Recenter on ${project.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          Recenter
        </button>

        <button
          type="button"
          className={styles.floatingBtn}
          onClick={() => setShowNearby((prev) => !prev)}
          aria-pressed={showNearby}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {showNearby ? "Hide Nearby Towers" : "Show Nearby Towers"}
        </button>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.floatingBtn}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Google Maps
        </a>
      </div>

      {/* Fallback & Error Status Overlay */}
      {status === "error" && (
        <div className={styles.statusOverlay} role="status">
          <p>Map could not be loaded. Please check your internet connection.</p>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.floatingBtn}
          >
            Open in Google Maps &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Lokalizacja } from "@/lib/types";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  value: Partial<Lokalizacja>;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapView({ value, onLocationSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      [value.lat || 52.0, value.lng || 19.0],
      value.lat && value.lng ? 13 : 6
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (value.lat && value.lng) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      map.setView([lat, lng], Math.max(map.getZoom(), 13));

      onLocationSelect(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (value.lat && value.lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lng]);
      } else {
        markerRef.current = L.marker([value.lat, value.lng]).addTo(mapRef.current);
      }
    }
  }, [value.lat, value.lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: "400px", width: "100%" }}
      className="z-0"
      role="application"
      aria-label="Mapa do wyboru lokalizacji. Kliknij aby wybrać miejsce."
    />
  );
}


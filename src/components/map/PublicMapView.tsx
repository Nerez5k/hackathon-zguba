"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { KategoriaIcons, type RzeczZnaleziona } from "@/lib/types";

const createMarkerIcon = (emoji: string, isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        font-size: 24px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${isSelected ? "#0b6cc1" : "white"};
        border: 3px solid ${isSelected ? "#095a9e" : "#0b6cc1"};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
        transition: all 0.2s;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

interface PublicMapViewProps {
  items: RzeczZnaleziona[];
  selectedItem: RzeczZnaleziona | null;
  onSelectItem: (item: RzeczZnaleziona) => void;
  userLocation: { lat: number; lng: number } | null;
  radiusKm: number;
  useGeoFilter: boolean;
}

export default function PublicMapView({
  items,
  selectedItem,
  onSelectItem,
  userLocation,
  radiusKm,
  useGeoFilter,
}: PublicMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCenteredOnUserRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([52.0, 19.0], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    if (userLocation) {
      const { lat, lng } = userLocation;
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div style="
            background:#0b6cc1;
            color:white;
            border-radius:50%;
            width:28px;
            height:28px;
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            font-size:16px;
          ">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
      }

      if (useGeoFilter) {
        if (userCircleRef.current) {
          userCircleRef.current.setLatLng([lat, lng]);
          userCircleRef.current.setRadius(radiusKm * 1000);
        } else {
          userCircleRef.current = L.circle([lat, lng], {
            radius: radiusKm * 1000,
            color: "#0b6cc1",
            fillColor: "#0b6cc1",
            fillOpacity: 0.08,
            weight: 1,
            dashArray: "4 4",
          }).addTo(map);
        }
      } else if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }

      if (!hasCenteredOnUserRef.current) {
        map.setView([lat, lng], 12, { animate: true });
        hasCenteredOnUserRef.current = true;
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
      hasCenteredOnUserRef.current = false;
    }
  }, [userLocation, radiusKm, useGeoFilter]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    items.forEach((item) => {
      if (!item.lokalizacja.lat || !item.lokalizacja.lng) return;

      const isSelected = selectedItem?.id === item.id;
      const emoji = KategoriaIcons[item.kategoria];

      const marker = L.marker([item.lokalizacja.lat, item.lokalizacja.lng], {
        icon: createMarkerIcon(emoji, isSelected),
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <p style="font-weight: bold; margin: 0 0 4px 0;">
            ${emoji} ${item.nazwa_przedmiotu}
          </p>
          <p style="font-size: 12px; color: #666; margin: 0;">
            ${item.lokalizacja.opis}
          </p>
          <p style="font-size: 11px; color: #0b6cc1; margin: 4px 0 0 0;">
            Kliknij, aby zobaczyć szczegóły
          </p>
        </div>
      `);

      marker.on("click", () => {
        onSelectItem(item);
      });

      markersRef.current.set(item.id, marker);
    });

    const coords: [number, number][] = items
      .filter((item) => item.lokalizacja.lat && item.lokalizacja.lng)
      .map((item) => [item.lokalizacja.lat, item.lokalizacja.lng] as [number, number]);

    if (userLocation) {
      coords.push([userLocation.lat, userLocation.lng]);
    }

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [items, onSelectItem, userLocation]);

  useEffect(() => {
    if (!mapRef.current || !selectedItem) return;

    const map = mapRef.current;

    if (selectedItem.lokalizacja.lat && selectedItem.lokalizacja.lng) {
      map.setView(
        [selectedItem.lokalizacja.lat, selectedItem.lokalizacja.lng],
        13,
        { animate: true }
      );

      markersRef.current.forEach((marker, id) => {
        const item = items.find((i) => i.id === id);
        if (item) {
          const isSelected = id === selectedItem.id;
          marker.setIcon(createMarkerIcon(KategoriaIcons[item.kategoria], isSelected));
        }
      });

      const marker = markersRef.current.get(selectedItem.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedItem, items]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
      role="application"
      aria-label="Mapa z rzeczami znalezionymi"
    />
  );
}


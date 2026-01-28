'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Place, Category } from '@/lib/types';

interface MapProps {
  places: (Place & { category: Category })[];
  onPlaceSelect?: (place: Place & { category: Category }) => void;
  selectedPlaceId?: string | null;
}

const ALMATY_CENTER: [number, number] = [76.945465, 43.238949];

export default function Map({ places, onPlaceSelect, selectedPlaceId }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [, setUserLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: ALMATY_CENTER,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        width: 36px;
        height: 36px;
        background-color: ${place.category?.color || '#3B82F6'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      el.innerHTML = place.category?.icon || '📍';

      if (selectedPlaceId === place.id) {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '10';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = selectedPlaceId === place.id ? 'scale(1.3)' : 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">${place.name}</h3>
            <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${place.address}</p>
            <button
              onclick="window.selectPlace('${place.id}')"
              style="
                background: #2563EB;
                color: white;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
                border: none;
                cursor: pointer;
              "
            >
              Подробнее
            </button>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPlaceSelect?.(place);
      });

      markersRef.current.push(marker);
    });

    // Global function for popup button
    (window as unknown as { selectPlace: (id: string) => void }).selectPlace = (id: string) => {
      const place = places.find(p => p.id === id);
      if (place) {
        window.location.href = `/places/${id}`;
      }
    };
  }, [places, selectedPlaceId, onPlaceSelect]);

  // Fly to selected place
  useEffect(() => {
    if (!map.current || !selectedPlaceId) return;

    const place = places.find(p => p.id === selectedPlaceId);
    if (place) {
      map.current.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedPlaceId, places]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);

        if (map.current) {
          // Remove old user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Add new user marker
          const el = document.createElement('div');
          el.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #3B82F6;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          `;

          userMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 1000,
          });
        }
      },
      () => {
        alert('Не удалось определить местоположение');
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Locate button */}
      <button
        onClick={handleLocateUser}
        className="absolute bottom-24 right-3 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
        title="Где я"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </button>
    </div>
  );
}

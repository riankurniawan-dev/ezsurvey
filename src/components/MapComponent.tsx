'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type SurveyPoint = {
  id: string
  areaName: string
  itemName: string
  status: string
  priority: string
  gpsLat: number
  gpsLng: number
  gpsAccuracy: number
  createdAt: string
  project: { id: string; name: string }
}

const getMarkerColor = (status: string): string => {
  switch (status) {
    case 'EXISTING': return '#22c55e'    // green
    case 'SELESAI': return '#22c55e'     // green
    case 'RUSAK': return '#ef4444'       // red
    case 'PERLU_PERBAIKAN': return '#f59e0b' // amber
    case 'PERLU_PENGGANTIAN': return '#f97316' // orange
    case 'PERLU_INSTALASI': return '#8b5cf6' // violet
    case 'TIDAK_ADA': return '#6b7280'   // gray
    default: return '#3b82f6'            // blue
  }
}

const createCustomIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      <circle cx="12" cy="8" r="3" fill="white"/>
    </svg>
  `
  return L.divIcon({
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: ''
  })
}

export default function MapComponent({ points }: { points: SurveyPoint[] }) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([-2.5, 118], 5) // Center on Indonesia

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    // Add markers
    const markers: L.Marker[] = []
    points.forEach((point) => {
      if (point.gpsLat && point.gpsLng) {
        const color = getMarkerColor(point.status)
        const marker = L.marker([point.gpsLat, point.gpsLng], {
          icon: createCustomIcon(color)
        })

        const statusText = point.status.replace(/_/g, ' ')
        
        marker.bindPopup(`
          <div style="min-width: 200px; font-family: Inter, sans-serif;">
            <h4 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">${point.itemName}</h4>
            <p style="margin: 0; color: #64748b; font-size: 12px;">${point.areaName} • ${point.project.name}</p>
            <div style="margin-top: 8px; padding: 4px 8px; background: ${color}20; border-radius: 6px; display: inline-block;">
              <span style="color: ${color}; font-size: 11px; font-weight: 600;">${statusText}</span>
            </div>
            <p style="margin-top: 8px; color: #94a3b8; font-size: 11px;">
              📍 ${point.gpsLat.toFixed(6)}, ${point.gpsLng.toFixed(6)}<br/>
              🎯 Akurasi: ±${point.gpsAccuracy?.toFixed(1) || '?'}m
            </p>
            <a href="/survey/${point.project.id}" style="display: block; margin-top: 8px; color: #3b82f6; font-size: 12px; text-decoration: none;">
              Lihat Detail →
            </a>
          </div>
        `, { className: 'custom-popup' })

        marker.addTo(map)
        markers.push(marker)
      }
    })

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 16 })
    }

    return () => {
      // Don't destroy map on re-render, just clean markers on next effect
    }
  }, [points])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-14rem)] rounded-2xl border border-slate-800 overflow-hidden"
      style={{ background: '#0f172a' }}
    />
  )
}

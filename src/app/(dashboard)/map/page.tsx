'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, MapPin } from 'lucide-react'

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
})

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

export default function MapPage() {
  const [points, setPoints] = useState<SurveyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/map')
      .then(r => r.json())
      .then(setPoints)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredPoints = useMemo(() => {
    if (filter === 'all') return points
    return points.filter(p => p.status === filter)
  }, [points, filter])

  const statusFilters = [
    { value: 'all', label: 'Semua', color: 'bg-slate-500' },
    { value: 'EXISTING', label: 'Existing', color: 'bg-emerald-500' },
    { value: 'RUSAK', label: 'Rusak', color: 'bg-red-500' },
    { value: 'PERLU_PERBAIKAN', label: 'Perlu Perbaikan', color: 'bg-amber-500' },
    { value: 'PERLU_PENGGANTIAN', label: 'Perlu Penggantian', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Peta Survey</h2>
          <p className="text-slate-400 mt-1">{filteredPoints.length} titik survey terdeteksi.</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors border flex items-center gap-2 ${
              filter === sf.value 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${sf.color}`} />
            {sf.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <MapComponent points={filteredPoints} />
      )}
    </div>
  )
}

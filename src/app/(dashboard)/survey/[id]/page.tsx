'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save, MapPin, Camera as CameraIcon, CheckCircle2, ChevronRight, Loader2, X, Send, CheckCircle, XCircle } from 'lucide-react'
import { getCurrentGPS, GPSLocation } from '@/lib/gps'
import { addWatermarkToImage } from '@/lib/camera'
import Swal from 'sweetalert2'

export default function SurveyExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeAreaIndex, setActiveAreaIndex] = useState(0)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  // GPS State
  const [gps, setGps] = useState<{ latitude: number, longitude: number, accuracy: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; newStatus: string }>({ isOpen: false, newStatus: '' })
  const [statusComment, setStatusComment] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [params.id])

  const getLocation = async () => {
    setGpsLoading(true)
    try {
      const loc = await getCurrentGPS()
      setGps(loc)
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: 'Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      })
    } finally {
      setGpsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-400">Project tidak ditemukan.</div>
  }

  const areas = project.template.areas || []
  const activeArea = areas[activeAreaIndex]

  const handleStatusChangeSubmit = async () => {
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusModal.newStatus, comment: statusComment })
      })
      if (res.ok) {
        setProject({ ...project, status: statusModal.newStatus })
        setStatusModal({ isOpen: false, newStatus: '' })
        setStatusComment('')
      } else {
        Swal.fire({
          title: 'Gagal',
          text: 'Gagal mengubah status project',
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStatusLoading(false)
    }
  }

  const isSupervisor = session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'ADMIN'
  const isSurveyor = session?.user?.role === 'SURVEYOR' || session?.user?.role === 'ADMIN'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* Custom Status Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/50">
            <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Status</h3>
            <p className="text-sm text-slate-400 mb-6">
              Anda akan mengubah status project ini menjadi <span className="font-bold text-white">{statusModal.newStatus}</span>.
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-slate-300">Catatan (Opsional)</label>
              <textarea
                value={statusComment}
                onChange={e => setStatusComment(e.target.value)}
                placeholder="Masukkan catatan tambahan di sini..."
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStatusModal({ isOpen: false, newStatus: '' })} disabled={statusLoading}>
                Batal
              </Button>
              <Button onClick={handleStatusChangeSubmit} isLoading={statusLoading}>
                Simpan Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" asChild>
            <Link href="/projects">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">{project.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                project.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                project.status === 'REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {project.status}
              </span>
              <p className="text-slate-400 text-sm">
                {project.client?.name} • {project.template.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {project.status !== 'APPROVED' && (
            <Button variant="secondary" onClick={getLocation} isLoading={gpsLoading} title="Ambil Lokasi GPS">
              <MapPin className="w-4 h-4 mr-2" /> Ambil GPS
            </Button>
          )}

          {isSurveyor && (project.status === 'DRAFT' || project.status === 'IN_PROGRESS' || project.status === 'REVISION') && (
            <Button onClick={() => setStatusModal({ isOpen: true, newStatus: 'REVIEW' })}>
              <Send className="w-4 h-4 mr-2" /> Ajukan Review
            </Button>
          )}

          {isSupervisor && project.status === 'REVIEW' && (
            <>
              <Button variant="danger" onClick={() => setStatusModal({ isOpen: true, newStatus: 'REVISION' })}>
                <XCircle className="w-4 h-4 mr-2" /> Revisi
              </Button>
              <Button onClick={() => setStatusModal({ isOpen: true, newStatus: 'APPROVED' })} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20">
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {gps && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
          <span>Lokasi Aktif: {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}</span>
          <span>Akurasi: ±{gps.accuracy.toFixed(1)}m</span>
        </div>
      )}

      {/* Manual GPS Input */}
      {project.status !== 'APPROVED' && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <p className="text-xs font-medium text-slate-400 mb-2">Input Koordinat Manual (opsional)</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-0.5 block">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="-6.123456"
                value={gps?.latitude ?? ''}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value)
                  setGps(prev => ({
                    latitude: isNaN(lat) ? 0 : lat,
                    longitude: prev?.longitude ?? 0,
                    accuracy: prev?.accuracy ?? 0,
                  }))
                }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-0.5 block">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="106.123456"
                value={gps?.longitude ?? ''}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value)
                  setGps(prev => ({
                    latitude: prev?.latitude ?? 0,
                    longitude: isNaN(lng) ? 0 : lng,
                    accuracy: prev?.accuracy ?? 0,
                  }))
                }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {gps && (
              <button
                onClick={() => setGps(null)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1.5 border border-red-500/20 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Areas Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {areas.map((area: any, index: number) => (
          <button
            key={area.id}
            onClick={() => {
              setActiveAreaIndex(index)
              setSelectedItem(null)
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeAreaIndex === index 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Items List */}
      {!selectedItem ? (
        <Card>
          <CardHeader className="border-b border-slate-800">
            <CardTitle>{activeArea?.name}</CardTitle>
            <p className="text-sm text-slate-400">Pilih item untuk memulai pengisian form survey.</p>
          </CardHeader>
          <div className="divide-y divide-slate-800/50">
            {activeArea?.items?.length === 0 && (
              <div className="p-8 text-center text-slate-500">Tidak ada item di area ini.</div>
            )}
            {activeArea?.items?.map((item: any) => {
              // Check if survey exists for this item (simplified check based on project surveys)
              const existingSurvey = project.surveys?.find((s: any) => s.areaName === activeArea.name && s.itemName === item.name)
              const isFilled = !!existingSurvey

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {isFilled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-blue-500 transition-colors" />
                    )}
                    <div>
                      <h4 className={`font-medium ${isFilled ? 'text-slate-300' : 'text-white group-hover:text-blue-400'} transition-colors`}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.checklists?.length || 0} Checklist • {item.dynamicFields?.length || 0} Form Tambahan
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                </button>
              )
            })}
          </div>
        </Card>
      ) : (
        /* Active Item Form */
        <SurveyItemForm 
          project={project}
          area={activeArea}
          item={selectedItem}
          gps={gps}
          onBack={() => setSelectedItem(null)}
          onSave={() => {
            // Re-fetch project or update local state to show tick mark
            setSelectedItem(null)
            router.refresh() // Simplest way to re-fetch Server Components, but we are client side so let's just use window.location or mutate.
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function SurveyItemForm({ project, area, item, gps, onBack, onSave }: any) {
  const [loading, setLoading] = useState(false)

  // Find existing survey data for this area+item
  const existingSurvey = project.surveys?.find(
    (s: any) => s.areaName === area.name && s.itemName === item.name
  )

  const [formData, setFormData] = useState<any>({
    status: existingSurvey?.status || 'EXISTING',
    priority: existingSurvey?.priority || 'MEDIUM',
    existingCondition: existingSurvey?.existingCondition || '',
    observation: existingSurvey?.observation || '',
    recommendation: existingSurvey?.recommendation || ''
  })
  
  // Initialize checklist state — merge template checklists with saved data
  const [checklists, setChecklists] = useState(() => {
    return (item.checklists || []).map((c: any) => {
      const saved = existingSurvey?.checklists?.find(
        (sc: any) => sc.checklistId === c.id
      )
      return {
        checklistId: c.id,
        name: c.name,
        checked: saved ? saved.checked : false
      }
    })
  })

  // Initialize dynamic fields state — merge template fields with saved data
  const [dynamicData, setDynamicData] = useState(() => {
    return (item.dynamicFields || []).map((f: any) => {
      const saved = existingSurvey?.dynamicData?.find(
        (sd: any) => sd.fieldId === f.id
      )
      return {
        fieldId: f.id,
        fieldType: f.fieldType,
        fieldName: f.label,
        value: saved ? saved.value || '' : ''
      }
    })
  })

  // Initialize photos from existing survey (show already-uploaded photos)
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    () => existingSurvey?.photos?.map((p: any) => p.path) || []
  )
  const [newPhotos, setNewPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Basic save logic
  const handleSave = async () => {
    setLoading(true)
    try {
      // 1. Upload NEW photos only and collect URLs
      const uploadedPhotoUrls: string[] = []
      for (const base64 of newPhotos) {
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, prefix: 'survey' })
        })
        if (upRes.ok) {
          const { url } = await upRes.json()
          uploadedPhotoUrls.push(url)
        }
      }

      // 2. Combine existing photo URLs with newly uploaded ones
      const allPhotoUrls = [...existingPhotoUrls, ...uploadedPhotoUrls]

      // 3. Save Survey Data with all photo URLs
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          areaName: area.name,
          itemName: item.name,
          ...formData,
          gpsLat: gps?.latitude,
          gpsLng: gps?.longitude,
          gpsAccuracy: gps?.accuracy,
          photos: allPhotoUrls,
          checklists,
          dynamicData
        })
      })
      if (res.ok) {
        onSave()
      } else {
        Swal.fire({
          title: 'Gagal',
          text: 'Gagal menyimpan data survey',
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCapturePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64String = event.target?.result as string
        const watermarkedImage = await addWatermarkToImage(base64String, {
          projectName: project.name,
          area: area.name,
          item: item.name,
          surveyor: project.surveyor?.name || 'Surveyor',
          latitude: gps?.latitude,
          longitude: gps?.longitude,
          accuracy: gps?.accuracy,
        })
        setNewPhotos(prev => [...prev, watermarkedImage])
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error applying watermark:', err)
      Swal.fire({
        title: 'Error',
        text: 'Gagal memproses foto',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      })
    }
  }

  return (
    <Card className="border-blue-500/30">
      <CardHeader className="border-b border-slate-800 bg-slate-900/50 flex flex-row items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-blue-400 font-medium mb-1">{area.name}</p>
          <CardTitle>{item.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        {/* Core Fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Status Aset</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="EXISTING">Existing (Ada)</option>
              <option value="TIDAK_ADA">Tidak Ada</option>
              <option value="RUSAK">Rusak</option>
              <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
              <option value="PERLU_PENGGANTIAN">Perlu Penggantian</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Prioritas</label>
            <select 
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
              <option value="CRITICAL">Kritis / Urgent</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Kondisi Existing</label>
            <textarea 
              value={formData.existingCondition}
              onChange={e => setFormData({ ...formData, existingCondition: e.target.value })}
              rows={2}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Observasi / Temuan</label>
            <textarea 
              value={formData.observation}
              onChange={e => setFormData({ ...formData, observation: e.target.value })}
              rows={2}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:border-amber-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Rekomendasi</label>
            <textarea 
              value={formData.recommendation}
              onChange={e => setFormData({ ...formData, recommendation: e.target.value })}
              rows={2}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Dynamic Checklists */}
        {checklists.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Item Pengecekan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checklists.map((c: any, idx: number) => (
                <label key={c.checklistId} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-900/50 cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={c.checked}
                    onChange={(e) => {
                      const newChecklists = [...checklists]
                      newChecklists[idx].checked = e.target.checked
                      setChecklists(newChecklists)
                    }}
                    className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300 select-none">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Form Fields */}
        {dynamicData.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Data Tambahan</h4>
            {dynamicData.map((d: any, idx: number) => {
              const handleChange = (val: string) => {
                const newData = [...dynamicData]
                newData[idx].value = val
                setDynamicData(newData)
              }

              const commonClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1"

              let inputElement = (
                <input
                  type="text"
                  value={d.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className={commonClasses}
                />
              )

              if (d.fieldType === 'Number' || d.fieldType === 'Currency') {
                inputElement = (
                  <input
                    type="number"
                    value={d.value}
                    onChange={(e) => handleChange(e.target.value)}
                    className={commonClasses}
                  />
                )
              } else if (d.fieldType === 'Date') {
                inputElement = (
                  <input
                    type="date"
                    value={d.value}
                    onChange={(e) => handleChange(e.target.value)}
                    className={commonClasses}
                    style={{ colorScheme: 'dark' }}
                  />
                )
              } else if (d.fieldType === 'Time') {
                inputElement = (
                  <input
                    type="time"
                    value={d.value}
                    onChange={(e) => handleChange(e.target.value)}
                    className={commonClasses}
                    style={{ colorScheme: 'dark' }}
                  />
                )
              } else if (d.fieldType === 'Checkbox' || d.fieldType === 'Toggle') {
                inputElement = (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={d.value === 'Ya'}
                      onChange={(e) => handleChange(e.target.checked ? 'Ya' : 'Tidak')}
                      className="w-5 h-5 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-400">{d.value === 'Ya' ? 'Ya / Ada / True' : 'Tidak / Kosong / False'}</span>
                  </div>
                )
              } else if (d.fieldType === 'Textarea') {
                inputElement = (
                  <textarea
                    value={d.value}
                    onChange={(e) => handleChange(e.target.value)}
                    rows={3}
                    className={commonClasses}
                  />
                )
              }

              return (
                <div key={d.fieldId} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">{d.fieldName}</label>
                  {inputElement}
                </div>
              )
            })}
          </div>
        )}

        {/* Camera Section */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-300">Foto / Dokumentasi</h4>
            <span className="text-xs text-slate-500">{existingPhotoUrls.length + newPhotos.length} Foto</span>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleCapturePhoto}
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {/* Existing saved photos */}
            {existingPhotoUrls.map((photoUrl, idx) => (
              <div key={`existing-${idx}`} className="relative aspect-[3/4] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden group">
                <img src={photoUrl} alt={`Foto ${idx+1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500/80 rounded text-[9px] text-white font-bold">Tersimpan</div>
                <button 
                  onClick={() => setExistingPhotoUrls(existingPhotoUrls.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Newly captured photos */}
            {newPhotos.map((photo, idx) => (
              <div key={`new-${idx}`} className="relative aspect-[3/4] bg-slate-900 rounded-xl border border-blue-500/30 overflow-hidden group">
                <img src={photo} alt={`Foto baru ${idx+1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-500/80 rounded text-[9px] text-white font-bold">Baru</div>
                <button 
                  onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <Button variant="secondary" className="w-full py-8 border-dashed border-2 border-slate-700 bg-slate-900/30" onClick={() => fileInputRef.current?.click()}>
            <div className="flex flex-col items-center text-slate-400">
              <CameraIcon className="w-8 h-8 mb-2" />
              <span>Ambil Foto dengan Watermark</span>
              <span className="text-[10px] mt-1 text-slate-500">Klik untuk membuka kamera</span>
            </div>
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <Button variant="ghost" onClick={onBack}>Batal</Button>
          <Button onClick={handleSave} isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Item
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}

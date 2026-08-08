'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Edit2, Trash2, Search, Loader2, Box, QrCode, ScanLine } from 'lucide-react'

import Swal from 'sweetalert2'

type Asset = {
  id: string
  name: string
  type: string
  serialNumber: string | null
  location: string | null
  status: string
  createdAt: string
  _count: { surveys: number }
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      setAssets(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAssets() }, [])

  const filteredAssets = assets.filter((a) => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    (a.serialNumber && a.serialNumber.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Asset?',
      text: 'Asset yang dihapus tidak bisa dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#f8fafc'
    })
    
    if (!result.isConfirmed) return
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      fetchAssets()
      Swal.fire({
        title: 'Terhapus!',
        text: 'Asset berhasil dihapus.',
        icon: 'success',
        background: '#0f172a',
        color: '#f8fafc',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      console.error(err)
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan jaringan',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      })
    }
  }

  const statusColors: Record<string, string> = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Inactive': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Maintenance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Broken': 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Asset Management</h2>
          <p className="text-slate-400 mt-1">Kelola aset perangkat, sensor, dan peralatan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <ScanLine className="w-4 h-4 mr-2" /> Scan QR
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Asset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Asset</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari nama, tipe, atau serial..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Asset</th>
                    <th className="px-6 py-4 font-medium">Tipe</th>
                    <th className="px-6 py-4 font-medium">Serial</th>
                    <th className="px-6 py-4 font-medium">Lokasi</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Survey</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAssets.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center">Tidak ada asset.</td></tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                              <Box className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="font-medium text-white">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{asset.type}</td>
                        <td className="px-6 py-4 font-mono text-xs">{asset.serialNumber || '-'}</td>
                        <td className="px-6 py-4">{asset.location || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[asset.status] || statusColors['Active']}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{asset._count.surveys}</td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(asset.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAssetModal onClose={() => setShowCreateModal(false)} onCreated={fetchAssets} />
      )}
    </div>
  )
}

function CreateAssetModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', type: '', serialNumber: '', location: '', description: '', status: 'Active'
  })

  const ASSET_TYPES = [
    'Flow Meter', 'Pump', 'Motor', 'Generator', 'PLC', 'Panel', 
    'Grounding', 'Fire Alarm', 'Valve', 'Tank', 'Sensor', 
    'Power Meter', 'Instrument', 'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        onCreated()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Tambah Asset Baru</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nama Asset" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Flow Meter WTP-01" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Tipe</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="">Pilih Tipe</option>
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Serial Number" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} placeholder="Opsional" />
          <Input label="Lokasi" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Opsional" />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

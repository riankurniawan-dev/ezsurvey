'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Save, Loader2, Upload, Settings } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    pdfHeaderTitle: 'Laporan Inspeksi & Survey Teknis',
    pdfHeaderSubtitle: 'SMART INSPECTION',
    pdfFooterText: '© HYDANT - Hak cipta dilindungi undang-undang.',
    pdfLogoUrl: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Pengaturan berhasil disimpan.',
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        Swal.fire({
          title: 'Gagal',
          text: 'Gagal menyimpan pengaturan',
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan jaringan',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, prefix: 'logo' })
        })
        if (res.ok) {
          const { url } = await res.json()
          setSettings({ ...settings, pdfLogoUrl: url })
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      Swal.fire({
        title: 'Gagal',
        text: 'Gagal upload logo',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pengaturan Sistem</h2>
        <p className="text-slate-400 mt-1">Konfigurasi format output laporan PDF dan sistem.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Format Cetak PDF
          </CardTitle>
          <CardDescription>
            Sesuaikan logo, judul header, dan catatan footer yang akan tercetak otomatis pada setiap laporan PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Logo Perusahaan / Sistem</label>
                <div className="flex items-center gap-4">
                  {settings.pdfLogoUrl ? (
                    <div className="relative group">
                      <img src={settings.pdfLogoUrl} alt="Logo" className="h-16 w-auto object-contain bg-white rounded p-1 border border-slate-700" />
                      <button 
                        onClick={() => setSettings({...settings, pdfLogoUrl: ''})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-32 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 bg-slate-800/50">
                      No Logo
                    </div>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Logo Baru
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadLogo} />
                </div>
              </div>
              
              <Input 
                label="Teks Header Utama" 
                value={settings.pdfHeaderTitle} 
                onChange={(e) => setSettings({...settings, pdfHeaderTitle: e.target.value})}
                placeholder="Contoh: HYDANT"
              />
              
              <Input 
                label="Teks Sub-header" 
                value={settings.pdfHeaderSubtitle} 
                onChange={(e) => setSettings({...settings, pdfHeaderSubtitle: e.target.value})}
                placeholder="Contoh: SMART INSPECTION"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Teks Footer Laporan</label>
              <textarea 
                value={settings.pdfFooterText}
                onChange={(e) => setSettings({...settings, pdfFooterText: e.target.value})}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1"
                placeholder="Masukkan teks footer yang akan muncul di setiap halaman PDF..."
              />
              <p className="text-xs text-slate-500 mt-2">Footer akan dicetak di bagian paling bawah pada setiap halaman dokumen A4.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="w-4 h-4 mr-2" /> Simpan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

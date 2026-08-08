'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Edit2, Trash2, Search, Loader2, FileText, LayoutTemplate } from 'lucide-react'
import Swal from 'sweetalert2'

type TemplateArea = {
  id: string
  name: string
  items: any[]
}

type SurveyTemplate = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  areas: TemplateArea[]
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SurveyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      setTemplates(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Template?',
      text: 'Peringatan: Jika template ini sudah digunakan di Project, menghapus template akan menyebabkan error pada data survey terkait. Apakah Anda yakin?',
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
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id))
        Swal.fire({
          title: 'Terhapus!',
          text: 'Template berhasil dihapus.',
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        const errorData = await res.json().catch(() => ({}))
        Swal.fire({
          title: 'Gagal',
          text: errorData.error || 'Gagal menghapus template',
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Survey Templates</h2>
          <p className="text-slate-400 mt-1">Kelola template survey dan dynamic form.</p>
        </div>
        <Button className="shrink-0" asChild>
          <Link href="/admin/templates/new">
            <Plus className="w-4 h-4 mr-2" />
            Buat Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Template</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari template..." 
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Tidak ada template survey.
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/50 transition-colors group flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                          <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white line-clamp-1" title={template.name}>
                            {template.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                            template.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {template.isActive ? 'Aktif' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 shrink-0">
                        <Link href={`/admin/form-builder/${template.id}`} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors block">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(template.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">
                      {template.description || 'Tidak ada deskripsi'}
                    </p>

                    <div className="pt-4 border-t border-slate-700/50 mt-auto flex justify-between items-center text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{template.areas?.length || 0} Area</span>
                      </div>
                      <div>
                        {new Date(template.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

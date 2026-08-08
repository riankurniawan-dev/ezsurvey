'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Loader2, FolderOpen, Calendar, MapPin, Building2, UserCircle2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

type Project = {
  id: string
  name: string
  location: string | null
  site: string | null
  status: string
  createdAt: string
  client: { name: string } | null
  template: { name: string }
  surveyor: { name: string }
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Project?',
      text: 'Apakah Anda yakin ingin menghapus project ini beserta seluruh data surveynya?',
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
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id))
        Swal.fire({
          title: 'Terhapus!',
          text: 'Project berhasil dihapus.',
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        Swal.fire({
          title: 'Gagal',
          text: 'Gagal menghapus project',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'REVISION': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'CLOSED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'Berjalan'
      case 'REVIEW': return 'Menunggu Review'
      case 'REVISION': return 'Revisi'
      case 'APPROVED': return 'Disetujui'
      case 'CLOSED': return 'Selesai'
      default: return 'Draft'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Project Survey</h2>
          <p className="text-slate-400 mt-1">Kelola project inspeksi dan survey di lapangan.</p>
        </div>
        <Button className="shrink-0" asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            Project Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Project</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari nama project..." 
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {filteredProjects.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Tidak ada project.
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} hoverable className="flex flex-col h-full bg-slate-800/30 border-slate-700/50">
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-white truncate" title={project.name}>
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                            <span className="text-xs text-slate-500 truncate">{project.template.name}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                          <FolderOpen className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-6">
                        {project.client && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">{project.client.name}</span>
                          </div>
                        )}
                        {(project.location || project.site) && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                              {[project.site, project.location].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <UserCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">{project.surveyor.name} (Surveyor)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span className="truncate">{format(new Date(project.createdAt), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-700/50 flex items-center gap-2">
                      <Button variant="secondary" className="flex-1" asChild>
                        <Link href={`/survey/${project.id}`}>
                          {project.status === 'IN_PROGRESS' ? 'Lanjutkan Survey' : 'Detail'}
                        </Link>
                      </Button>
                      {session?.user?.role === 'ADMIN' && (
                        <Button variant="danger" className="px-3" onClick={() => handleDelete(project.id)} title="Hapus Project">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  FolderOpen, ClipboardList, Users, Building2, 
  ArrowRight, Loader2, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, BarChart3
} from 'lucide-react'

type DashboardData = {
  totalProjects: number
  totalSurveys: number
  totalUsers: number
  totalClients: number
  totalTemplates: number
  statusCounts: Record<string, number>
  priorityCounts: Record<string, number>
  inProgress: number
  review: number
  approved: number
  closed: number
  recentProjects: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Project', value: data?.totalProjects || 0, icon: FolderOpen, color: 'blue', href: '/projects' },
    { label: 'Total Survey', value: data?.totalSurveys || 0, icon: ClipboardList, color: 'indigo', href: '/projects' },
    { label: 'Sedang Berjalan', value: data?.inProgress || 0, icon: Clock, color: 'amber', href: '/projects' },
    { label: 'Selesai', value: data?.approved || 0, icon: CheckCircle2, color: 'emerald', href: '/projects' },
  ]

  const adminStats = [
    { label: 'Users', value: data?.totalUsers || 0, icon: Users, color: 'violet', href: '/admin/users' },
    { label: 'Clients', value: data?.totalClients || 0, icon: Building2, color: 'cyan', href: '/admin/clients' },
    { label: 'Templates', value: data?.totalTemplates || 0, icon: ClipboardList, color: 'pink', href: '/admin/templates' },
  ]

  const colorMap: Record<string, { bg: string; icon: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20', text: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20', text: 'text-violet-400' },
    cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    pink: { bg: 'bg-pink-500/10', icon: 'text-pink-400', border: 'border-pink-500/20', text: 'text-pink-400' },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }
  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'Berjalan'
      case 'REVIEW': return 'Review'
      case 'APPROVED': return 'Disetujui'
      case 'CLOSED': return 'Selesai'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Selamat datang, {session?.user?.name} 👋
        </h2>
        <p className="text-slate-400 mt-1">Berikut ringkasan aktivitas survey Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const c = colorMap[stat.color]
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hoverable className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center border ${c.border}`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Admin Stats */}
      {session?.user?.role === 'ADMIN' && (
        <div className="grid grid-cols-3 gap-4">
          {adminStats.map((stat) => {
            const Icon = stat.icon
            const c = colorMap[stat.color]
            return (
              <Link key={stat.label} href={stat.href}>
                <Card hoverable className="h-full">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center border ${c.border} shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Project Status Breakdown + Priority Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Project Status */}
        <Card>
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Status Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {['IN_PROGRESS', 'REVIEW', 'REVISION', 'APPROVED', 'CLOSED'].map((status) => {
              const count = data?.statusCounts?.[status] || 0
              const total = data?.totalProjects || 1
              const pct = Math.round((count / total) * 100) || 0
              return (
                <div key={status} className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-20">{getStatusText(status)}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        status === 'REVIEW' ? 'bg-amber-500' :
                        status === 'REVISION' ? 'bg-red-500' :
                        status === 'APPROVED' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Prioritas Survey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => {
              const count = data?.priorityCounts?.[priority] || 0
              const total = data?.totalSurveys || 1
              const pct = Math.round((count / total) * 100) || 0
              return (
                <div key={priority} className="flex items-center gap-4">
                  <span className={`text-xs w-20 font-medium ${
                    priority === 'CRITICAL' ? 'text-red-400' :
                    priority === 'HIGH' ? 'text-amber-400' :
                    priority === 'MEDIUM' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {priority === 'CRITICAL' ? 'Kritis' : priority === 'HIGH' ? 'Tinggi' : priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        priority === 'CRITICAL' ? 'bg-red-500' :
                        priority === 'HIGH' ? 'bg-amber-500' :
                        priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle>Project Terbaru</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <div className="divide-y divide-slate-800/50">
          {data?.recentProjects?.length === 0 && (
            <div className="p-8 text-center text-slate-500">Belum ada project. Buat project baru untuk memulai.</div>
          )}
          {data?.recentProjects?.map((project: any) => (
            <Link key={project.id} href={`/survey/${project.id}`} className="block">
              <div className="p-4 hover:bg-slate-800/20 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">{project.name}</h4>
                    <p className="text-xs text-slate-500 truncate">
                      {project.client?.name || 'No Client'} • {project.surveyor?.name}
                      {project._count?.surveys > 0 && ` • ${project._count.surveys} survey`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileText, Search, Loader2, Download, Printer, ExternalLink } from 'lucide-react'

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/reports?status=APPROVED') // Only show approved projects in reports by default, or all
      .then(r => r.json())
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reports & Export</h2>
          <p className="text-slate-400 mt-1">Generate PDF laporan dari survey yang telah selesai dan disetujui.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Project Laporan</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari project atau client..." 
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
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Template</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredProjects.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center">Tidak ada laporan tersedia.</td></tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                              <FileText className="w-4 h-4 text-pink-400" />
                            </div>
                            <span className="font-medium text-white">{project.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{project.client?.name || '-'}</td>
                        <td className="px-6 py-4">{project.template?.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/report/${project.id}`} target="_blank">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Lihat PDF
                            </Link>
                          </Button>
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
    </div>
  )
}

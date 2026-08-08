'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft } from 'lucide-react'

type Client = { id: string; name: string }
type Template = { id: string; name: string }

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [clients, setClients] = useState<Client[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [location, setLocation] = useState('')
  const [site, setSite] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/templates').then(r => r.json())
    ]).then(([clientsData, templatesData]) => {
      setClients(clientsData)
      setTemplates(templatesData.filter((t: any) => t.isActive))
    }).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          clientId,
          templateId,
          location,
          site,
          surveyorId: session?.user?.id
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await res.json()
      router.push(`/survey/${data.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="px-2" asChild>
          <Link href="/projects">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Project Baru</h2>
          <p className="text-slate-400 mt-1">Buat project inspeksi/survey baru.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nama Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Inspeksi Tahunan WTP Site A"
              required
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Client / Perusahaan</label>
                <select 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- Pilih Client (Opsional) --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Template Survey *</label>
                <select 
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- Pilih Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                label="Lokasi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jakarta"
              />
              <Input
                label="Site / Area"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="Contoh: Plant 1"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" isLoading={loading}>
                Buat & Mulai Survey
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

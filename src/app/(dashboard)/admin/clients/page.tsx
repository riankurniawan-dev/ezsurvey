'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Edit2, Trash2, Search, Loader2, Building2, X } from 'lucide-react'

type Client = {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  createdAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter((client) => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Client Management</h2>
          <p className="text-slate-400 mt-1">Kelola data client dan perusahaan.</p>
        </div>
        <Button className="shrink-0" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Client
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Client</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari nama atau email client..." 
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
              {filteredClients.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Tidak ada data client.
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div key={client.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white truncate max-w-[150px]" title={client.name}>
                            {client.name}
                          </h3>
                          <p className="text-xs text-slate-400 truncate max-w-[150px]" title={client.email || '-'}>
                            {client.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 truncate" title={client.address || '-'}>
                        <span className="font-medium text-slate-300">Alamat:</span> {client.address || '-'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-300">Telepon:</span> {client.phone || '-'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateClientModal onClose={() => setShowCreateModal(false)} onCreated={fetchClients} />
      )}
    </div>
  )
}

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clients', {
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
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Tambah Client Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nama Perusahaan" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="PT Maju Jaya" required />
          <Input type="email" label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@company.com" />
          <Input label="Telepon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="021-xxxxxx" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Alamat</label>
            <textarea 
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

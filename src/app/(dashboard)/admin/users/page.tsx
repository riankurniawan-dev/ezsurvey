'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Edit2, Trash2, Search, Loader2, X } from 'lucide-react'
import Swal from 'sweetalert2'

type User = {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: 'User yang memiliki riwayat project atau survey tidak bisa dihapus.',
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
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
        Swal.fire({
          title: 'Terhapus!',
          text: 'User berhasil dihapus.',
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
          text: errorData.error || 'Gagal menghapus user',
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
          <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
          <p className="text-slate-400 mt-1">Kelola akses dan role pengguna sistem.</p>
        </div>
        <Button className="shrink-0" onClick={() => { setSelectedUser(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <CardTitle>Daftar Pengguna</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Cari nama atau email..." 
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
                    <th className="px-6 py-4 font-medium">Nama</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        Tidak ada data pengguna.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => { setSelectedUser(user); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

      {showModal && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setShowModal(false)} 
          onSaved={fetchUsers} 
        />
      )}
    </div>
  )
}

function UserModal({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'SURVEYOR',
    phone: user?.phone || '',
    isActive: user ? user.isActive : true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        onSaved()
        onClose()
      } else {
        const errorData = await res.json().catch(() => ({}))
        Swal.fire('Gagal', errorData.error || 'Gagal menyimpan user', 'error')
      }
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">{user ? 'Edit User' : 'Tambah User Baru'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <Input label="Nama Lengkap" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
          <Input type="email" label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" required />
          <Input type="password" label={user ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="***" required={!user} />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="SURVEYOR">Surveyor</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <Input label="Telepon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0812xxx" />
          
          {user && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-300">Akun Aktif</span>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

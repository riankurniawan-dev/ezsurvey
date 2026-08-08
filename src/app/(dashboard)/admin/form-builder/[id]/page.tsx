'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Settings2, Loader2 } from 'lucide-react'

// Types
type FieldConfig = {
  id: string
  fieldType: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

type ChecklistItem = {
  id: string
  name: string
}

type SurveyItem = {
  id: string
  name: string
  checklists: ChecklistItem[]
  dynamicFields: FieldConfig[]
}

type SurveyArea = {
  id: string
  name: string
  items: SurveyItem[]
}

const FIELD_TYPES = [
  'Text', 'Number', 'Currency', 'Dropdown', 'Multi Select', 
  'Checkbox', 'Radio', 'Date', 'Time', 'GPS', 'Camera', 
  'Signature', 'File', 'QR Scanner', 'Barcode Scanner', 'Rating', 'Toggle', 'Textarea'
]

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const [templateName, setTemplateName] = useState('Loading...')
  const [areas, setAreas] = useState<SurveyArea[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch existing template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/templates/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setTemplateName(data.name)
          if (data.areas) {
            // Transform data back to builder state if needed, here we just use it directly
            const mappedAreas = data.areas.map((area: any) => ({
              id: area.id || crypto.randomUUID(),
              name: area.name,
              items: area.items.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                name: item.name,
                checklists: item.checklists?.map((c: any) => ({ id: c.id || crypto.randomUUID(), name: c.name })) || [],
                dynamicFields: item.dynamicFields?.map((f: any) => ({
                  id: f.id || crypto.randomUUID(),
                  fieldType: f.fieldType,
                  label: f.label,
                  placeholder: f.placeholder,
                  required: f.required,
                  options: f.options ? JSON.parse(f.options) : undefined
                })) || []
              }))
            }))
            setAreas(mappedAreas)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [params.id])

  // --- Handlers ---
  const addArea = () => {
    setAreas([...areas, { id: crypto.randomUUID(), name: 'Area Baru', items: [] }])
  }
  const updateArea = (areaId: string, name: string) => {
    setAreas(areas.map(a => a.id === areaId ? { ...a, name } : a))
  }
  const removeArea = (areaId: string) => {
    setAreas(areas.filter(a => a.id !== areaId))
  }

  const addItem = (areaId: string) => {
    setAreas(areas.map(a => {
      if (a.id === areaId) {
        return {
          ...a,
          items: [...a.items, { id: crypto.randomUUID(), name: 'Item Survey Baru', checklists: [], dynamicFields: [] }]
        }
      }
      return a
    }))
  }
  const updateItem = (areaId: string, itemId: string, name: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? { ...i, name } : i)
    } : a))
  }
  const removeItem = (areaId: string, itemId: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.filter(i => i.id !== itemId)
    } : a))
  }

  const addChecklist = (areaId: string, itemId: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        checklists: [...i.checklists, { id: crypto.randomUUID(), name: 'Pekerjaan Check' }]
      } : i)
    } : a))
  }
  const updateChecklist = (areaId: string, itemId: string, checklistId: string, name: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        checklists: i.checklists.map(c => c.id === checklistId ? { ...c, name } : c)
      } : i)
    } : a))
  }
  const removeChecklist = (areaId: string, itemId: string, checklistId: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        checklists: i.checklists.filter(c => c.id !== checklistId)
      } : i)
    } : a))
  }

  const addField = (areaId: string, itemId: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        dynamicFields: [...i.dynamicFields, { id: crypto.randomUUID(), fieldType: 'Text', label: 'Field Baru', required: false }]
      } : i)
    } : a))
  }
  const updateField = (areaId: string, itemId: string, fieldId: string, changes: Partial<FieldConfig>) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        dynamicFields: i.dynamicFields.map(f => f.id === fieldId ? { ...f, ...changes } : f)
      } : i)
    } : a))
  }
  const removeField = (areaId: string, itemId: string, fieldId: string) => {
    setAreas(areas.map(a => a.id === areaId ? {
      ...a,
      items: a.items.map(i => i.id === itemId ? {
        ...i,
        dynamicFields: i.dynamicFields.filter(f => f.id !== fieldId)
      } : i)
    } : a))
  }

  const saveTemplate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/templates/${params.id}/builder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas })
      })
      if (res.ok) {
        router.push('/admin/templates')
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" asChild>
            <Link href="/admin/templates">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{templateName}</h2>
            <p className="text-slate-400 text-sm">Dynamic Form Builder</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addArea}>
            <Plus className="w-4 h-4 mr-2" /> Area Baru
          </Button>
          <Button onClick={saveTemplate} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" /> Simpan
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {areas.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
            Mulai dengan menambahkan Area pertama
          </div>
        )}

        {areas.map((area, aIndex) => (
          <Card key={area.id} className="border-slate-700/50 relative overflow-visible">
            <div className="absolute -left-3 top-6 bottom-6 w-1 bg-blue-500 rounded-full" />
            <CardHeader className="bg-slate-800/30">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
                <div className="flex-1">
                  <Input 
                    value={area.name} 
                    onChange={e => updateArea(area.id, e.target.value)}
                    className="font-bold text-lg border-transparent hover:border-slate-700 focus:border-blue-500 bg-transparent px-0"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeArea(area.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {area.items.map((item, iIndex) => (
                <div key={item.id} className="border border-slate-700 rounded-xl bg-slate-900/80 p-4 relative ml-4">
                   <div className="absolute -left-px top-4 bottom-4 w-[2px] bg-indigo-500/50 rounded-full" />
                  <div className="flex items-center gap-3 mb-4">
                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                    <div className="flex-1">
                      <Input 
                        value={item.name} 
                        onChange={e => updateItem(area.id, item.id, e.target.value)}
                        className="font-semibold border-transparent hover:border-slate-700 focus:border-blue-500 bg-transparent h-8"
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(area.id, item.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pl-7">
                    {/* Checklists */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-300">Checklist Standar</h4>
                        <Button variant="ghost" size="sm" onClick={() => addChecklist(area.id, item.id)} className="h-6 px-2 text-xs text-blue-400">
                          <Plus className="w-3 h-3 mr-1" /> Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {item.checklists.length === 0 && <p className="text-xs text-slate-500 italic">Tidak ada checklist</p>}
                        {item.checklists.map((checklist) => (
                          <div key={checklist.id} className="flex items-center gap-2">
                            <input type="checkbox" disabled className="rounded bg-slate-800 border-slate-700" />
                            <input 
                              type="text" 
                              value={checklist.name}
                              onChange={e => updateChecklist(area.id, item.id, checklist.id, e.target.value)}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={() => removeChecklist(area.id, item.id, checklist.id)} className="text-slate-500 hover:text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-300">Form Tambahan</h4>
                        <Button variant="ghost" size="sm" onClick={() => addField(area.id, item.id)} className="h-6 px-2 text-xs text-indigo-400">
                          <Plus className="w-3 h-3 mr-1" /> Tambah Field
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {item.dynamicFields.length === 0 && <p className="text-xs text-slate-500 italic">Tidak ada form tambahan</p>}
                        {item.dynamicFields.map((field) => (
                          <div key={field.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={field.label}
                                onChange={e => updateField(area.id, item.id, field.id, { label: e.target.value })}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm font-medium text-white focus:outline-none focus:border-blue-500"
                                placeholder="Label Field"
                              />
                              <button onClick={() => removeField(area.id, item.id, field.id)} className="text-slate-500 hover:text-red-400">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <select 
                                value={field.fieldType}
                                onChange={e => updateField(area.id, item.id, field.id, { fieldType: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none flex-1"
                              >
                                {FIELD_TYPES.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <label className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 rounded-md border border-slate-700">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={e => updateField(area.id, item.id, field.id, { required: e.target.checked })}
                                  className="rounded bg-slate-800 border-slate-600"
                                />
                                Wajib
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="ghost" size="sm" onClick={() => addItem(area.id)} className="w-full border border-dashed border-slate-700 text-slate-400 hover:text-white mt-2">
                <Plus className="w-4 h-4 mr-2" /> Tambah Item ke {area.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}

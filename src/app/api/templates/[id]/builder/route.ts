import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { areas } = body

    await prisma.$transaction(async (tx) => {
      // 1. Gather all incoming IDs to identify what should be kept
      const incomingAreaIds = areas.map((a: any) => a.id).filter(Boolean)
      const incomingItemIds = areas.flatMap((a: any) => a.items?.map((i: any) => i.id) || []).filter(Boolean)
      const incomingChecklistIds = areas.flatMap((a: any) => a.items?.flatMap((i: any) => i.checklists?.map((c: any) => c.id) || []) || []).filter(Boolean)
      const incomingFieldIds = areas.flatMap((a: any) => a.items?.flatMap((i: any) => i.dynamicFields?.map((f: any) => f.id) || []) || []).filter(Boolean)

      // 2. Delete removed entities
      await tx.dynamicFormField.deleteMany({
        where: { item: { area: { templateId: id } }, id: { notIn: incomingFieldIds } }
      })
      
      await tx.templateChecklist.deleteMany({
        where: { item: { area: { templateId: id } }, id: { notIn: incomingChecklistIds } }
      })
      
      await tx.templateItem.deleteMany({
        where: { area: { templateId: id }, id: { notIn: incomingItemIds } }
      })
      
      await tx.templateArea.deleteMany({
        where: { templateId: id, id: { notIn: incomingAreaIds } }
      })

      // 3. Upsert areas, items, checklists, and fields (preserves existing IDs)
      for (let i = 0; i < areas.length; i++) {
        const areaData = areas[i]
        
        const area = await tx.templateArea.upsert({
          where: { id: areaData.id },
          update: { name: areaData.name, sortOrder: i },
          create: { id: areaData.id, templateId: id, name: areaData.name, sortOrder: i }
        })

        if (areaData.items && areaData.items.length > 0) {
          for (let j = 0; j < areaData.items.length; j++) {
            const itemData = areaData.items[j]

            const item = await tx.templateItem.upsert({
              where: { id: itemData.id },
              update: { name: itemData.name, sortOrder: j, areaId: area.id },
              create: { id: itemData.id, areaId: area.id, name: itemData.name, sortOrder: j }
            })

            if (itemData.checklists && itemData.checklists.length > 0) {
              for (let k = 0; k < itemData.checklists.length; k++) {
                const c = itemData.checklists[k]
                await tx.templateChecklist.upsert({
                  where: { id: c.id },
                  update: { name: c.name, sortOrder: k, itemId: item.id },
                  create: { id: c.id, itemId: item.id, name: c.name, sortOrder: k }
                })
              }
            }

            if (itemData.dynamicFields && itemData.dynamicFields.length > 0) {
              for (let k = 0; k < itemData.dynamicFields.length; k++) {
                const f = itemData.dynamicFields[k]
                
                const optionsString = f.options ? (typeof f.options === 'string' ? f.options : JSON.stringify(f.options)) : null
                const conditionalString = f.conditionalLogic ? (typeof f.conditionalLogic === 'string' ? f.conditionalLogic : JSON.stringify(f.conditionalLogic)) : null
                
                await tx.dynamicFormField.upsert({
                  where: { id: f.id },
                  update: {
                    fieldType: f.fieldType,
                    label: f.label,
                    placeholder: f.placeholder || null,
                    options: optionsString,
                    required: f.required || false,
                    conditionalLogic: conditionalString,
                    sortOrder: k,
                    itemId: item.id
                  },
                  create: {
                    id: f.id,
                    itemId: item.id,
                    fieldType: f.fieldType,
                    label: f.label,
                    placeholder: f.placeholder || null,
                    options: optionsString,
                    required: f.required || false,
                    conditionalLogic: conditionalString,
                    sortOrder: k
                  }
                })
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Builder save error:', error)
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Tidak dapat menghapus Area/Item/Checklist karena sudah digunakan di dalam Survey.' 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save template structure' }, { status: 500 })
  }
}

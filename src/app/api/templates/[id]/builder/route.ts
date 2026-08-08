import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { areas } = body // areas is an array of Area objects containing items, checklists, and dynamicFields

    // Use a transaction to safely update the template structure
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing areas (this will cascade delete items, checklists, and fields)
      await tx.templateArea.deleteMany({
        where: { templateId: id }
      })

      // 2. Recreate the structure
      for (let i = 0; i < areas.length; i++) {
        const areaData = areas[i]
        
        const area = await tx.templateArea.create({
          data: {
            templateId: id,
            name: areaData.name,
            sortOrder: i,
          }
        })

        if (areaData.items && areaData.items.length > 0) {
          for (let j = 0; j < areaData.items.length; j++) {
            const itemData = areaData.items[j]

            const item = await tx.templateItem.create({
              data: {
                areaId: area.id,
                name: itemData.name,
                sortOrder: j,
              }
            })

            // Create Checklists
            if (itemData.checklists && itemData.checklists.length > 0) {
              await tx.templateChecklist.createMany({
                data: itemData.checklists.map((c: any, k: number) => ({
                  itemId: item.id,
                  name: c.name,
                  sortOrder: k,
                }))
              })
            }

            // Create Dynamic Fields
            if (itemData.dynamicFields && itemData.dynamicFields.length > 0) {
              await tx.dynamicFormField.createMany({
                data: itemData.dynamicFields.map((f: any, k: number) => ({
                  itemId: item.id,
                  fieldType: f.fieldType,
                  label: f.label,
                  placeholder: f.placeholder,
                  options: f.options ? JSON.stringify(f.options) : null,
                  required: f.required || false,
                  conditionalLogic: f.conditionalLogic ? JSON.stringify(f.conditionalLogic) : null,
                  sortOrder: k,
                }))
              })
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Builder save error:', error)
    return NextResponse.json({ error: 'Failed to save template structure' }, { status: 500 })
  }
}

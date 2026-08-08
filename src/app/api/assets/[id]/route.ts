import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        surveys: {
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { name: true } },
            photos: { take: 4 }
          }
        }
      }
    })

    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, serialNumber, location, description, status } = body

    const asset = await prisma.asset.update({
      where: { id },
      data: { name, type, serialNumber, location, description, status },
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.asset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}

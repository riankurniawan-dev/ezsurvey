import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const assets = await prisma.asset.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { serialNumber: { contains: search } },
          { type: { contains: search } },
        ]
      } : {},
      include: {
        _count: { select: { surveys: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, serialNumber, location, description, status } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    // Generate QR code data (just use asset ID as content)
    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        serialNumber,
        location,
        description,
        status: status || 'Active',
      },
    })

    // Set QR code as a URL to the asset detail
    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        qrCode: JSON.stringify({ assetId: asset.id, name, type, serialNumber })
      }
    })

    return NextResponse.json(updatedAsset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      where: {
        gpsLat: { not: null },
        gpsLng: { not: null },
      },
      select: {
        id: true,
        areaName: true,
        itemName: true,
        status: true,
        priority: true,
        gpsLat: true,
        gpsLng: true,
        gpsAccuracy: true,
        createdAt: true,
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(surveys)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 })
  }
}

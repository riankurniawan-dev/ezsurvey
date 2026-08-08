import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const surveys = await prisma.survey.findMany({
      where: { projectId: id },
      include: {
        photos: true,
      },
      orderBy: [
        { areaName: 'asc' },
        { itemName: 'asc' }
      ]
    })
    return NextResponse.json(surveys)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
  }
}

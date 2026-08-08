import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (status) where.status = status
    if (projectId) where.id = projectId

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { name: true } },
        template: { select: { name: true } },
        surveyor: { select: { name: true } },
        _count: { select: { surveys: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports data' }, { status: 500 })
  }
}

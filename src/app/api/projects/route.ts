import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Surveyors only see their own projects, Admins/Supervisors see all
    const whereClause = session.user.role === 'SURVEYOR' ? { surveyorId: session.user.id } : {}

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: { select: { name: true } },
        template: { select: { name: true } },
        surveyor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, location, site, clientId, templateId, surveyorId } = body

    if (!name || !templateId || !surveyorId) {
      return NextResponse.json({ error: 'Name, Template, and Surveyor are required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        location,
        site,
        clientId: clientId || null,
        templateId,
        surveyorId,
        status: 'IN_PROGRESS',
        startDate: new Date(),
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

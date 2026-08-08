import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      totalProjects,
      totalSurveys,
      projectsByStatus,
      recentProjects,
      surveysByPriority,
      totalUsers,
      totalClients,
      totalTemplates
    ] = await Promise.all([
      prisma.project.count(),
      prisma.survey.count(),
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: { select: { name: true } },
          surveyor: { select: { name: true } },
          _count: { select: { surveys: true } }
        }
      }),
      prisma.survey.groupBy({
        by: ['priority'],
        _count: { id: true }
      }),
      prisma.user.count(),
      prisma.client.count(),
      prisma.surveyTemplate.count()
    ])

    // Convert groupBy results to objects
    const statusCounts: Record<string, number> = {}
    projectsByStatus.forEach((s: any) => { statusCounts[s.status] = s._count.id })

    const priorityCounts: Record<string, number> = {}
    surveysByPriority.forEach((p: any) => { priorityCounts[p.priority] = p._count.id })

    return NextResponse.json({
      totalProjects,
      totalSurveys,
      totalUsers,
      totalClients,
      totalTemplates,
      statusCounts,
      priorityCounts,
      recentProjects,
      inProgress: statusCounts['IN_PROGRESS'] || 0,
      review: statusCounts['REVIEW'] || 0,
      approved: statusCounts['APPROVED'] || 0,
      closed: statusCounts['CLOSED'] || 0,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

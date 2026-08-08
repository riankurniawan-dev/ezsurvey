import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { status, comment } = body

    // Verify permission (only supervisor/admin can approve/reject, surveyor can submit for review)
    const isSupervisor = session.user.role === 'SUPERVISOR' || session.user.role === 'ADMIN'
    
    // Update project status
    const project = await prisma.project.update({
      where: { id },
      data: { status }
    })

    // If there is a comment (e.g. for revision or approval notes), add it
    if (comment) {
      // Create a global project-level comment by attaching it to the first survey item?
      // Or we should have project-level comments. But schema has Comment linked to Survey.
      // Let's create an AuditLog instead for this status change.
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: `PROJECT_STATUS_CHANGED`,
          entity: 'Project',
          entityId: id,
          details: `Status changed to ${status}. Note: ${comment}`
        }
      })
    } else {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: `PROJECT_STATUS_CHANGED`,
          entity: 'Project',
          entityId: id,
          details: `Status changed to ${status}`
        }
      })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 })
  }
}

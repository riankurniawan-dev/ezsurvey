import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { 
      projectId, areaName, itemName, status, priority, 
      location, gpsLat, gpsLng, gpsAccuracy, 
      existingCondition, observation, recommendation,
      materialExisting, estimasiMaterial, estimasiPekerjaan, conclusion,
      checklists, dynamicData,
      photos // array of uploaded URLs like ["/uploads/survey-xxx.jpg"]
    } = body

    if (!projectId || !areaName || !itemName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Manual upsert logic
    let survey = await prisma.survey.findFirst({
      where: { projectId, areaName, itemName }
    })

    const surveyData = {
      status: status || 'EXISTING',
      priority: priority || 'MEDIUM',
      location, gpsLat, gpsLng, gpsAccuracy, 
      gpsTimestamp: gpsLat ? new Date() : null,
      existingCondition, observation, recommendation,
      materialExisting, estimasiMaterial, estimasiPekerjaan, conclusion,
      userId: session.user.id
    }

    if (survey) {
      survey = await prisma.survey.update({
        where: { id: survey.id },
        data: surveyData
      })
    } else {
      survey = await prisma.survey.create({
        data: {
          ...surveyData,
          projectId,
          areaName,
          itemName
        }
      })
    }

    // Save photos to Photo table
    if (photos && Array.isArray(photos) && photos.length > 0) {
      // Delete old photos for this survey first (replace strategy)
      await prisma.photo.deleteMany({
        where: { surveyId: survey.id }
      })

      // Create new photo records
      await prisma.photo.createMany({
        data: photos.map((photoUrl: string) => ({
          surveyId: survey!.id,
          path: photoUrl,
          category: 'EXISTING' as const,
          gpsLat: gpsLat || null,
          gpsLng: gpsLng || null,
        }))
      })
    }

    // Save checklists
    if (checklists && Array.isArray(checklists)) {
      await prisma.surveyChecklist.deleteMany({ where: { surveyId: survey.id } })
      if (checklists.length > 0) {
        await prisma.surveyChecklist.createMany({
          data: checklists.map((c: any) => ({
            surveyId: survey!.id,
            checklistId: c.checklistId,
            checked: c.checked
          }))
        })
      }
    }

    // Save dynamic data
    if (dynamicData && Array.isArray(dynamicData)) {
      await prisma.surveyDynamicData.deleteMany({ where: { surveyId: survey.id } })
      if (dynamicData.length > 0) {
        await prisma.surveyDynamicData.createMany({
          data: dynamicData.map((d: any) => ({
            surveyId: survey!.id,
            fieldId: d.fieldId,
            fieldType: d.fieldType,
            fieldName: d.fieldName,
            value: d.value
          }))
        })
      }
    }

    // Also update project status to IN_PROGRESS if it's still DRAFT
    await prisma.project.updateMany({
      where: { id: projectId, status: 'DRAFT' },
      data: { status: 'IN_PROGRESS' }
    })

    // Return survey with photos
    const result = await prisma.survey.findUnique({
      where: { id: survey.id },
      include: { photos: true }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Survey save error:', error)
    return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 })
  }
}

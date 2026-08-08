import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany()
    const config = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value
      return acc
    }, {})
    
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates = []

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        updates.push(
          prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
          })
        )
      }
    }

    await prisma.$transaction(updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

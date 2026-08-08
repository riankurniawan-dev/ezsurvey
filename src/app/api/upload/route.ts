import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image, prefix = 'photo' } = body

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Generate filename
    const filename = `${prefix}-${uuidv4()}.jpg`
    
    // Define path in public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadDir, filename)
    
    // Ensure directory exists (in production you'd use a real storage service)
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // Write file
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const publicUrl = `/uploads/${filename}`
    
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

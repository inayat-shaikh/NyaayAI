import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { promises as fsPromises } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPEG, PNG, TIFF, DOC, and DOCX files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents')
    
    // Ensure upload directory exists
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists or other error
      console.log('Upload directory check:', error.message)
    }

    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Save document info to database
    const document = await db.document.create({
      data: {
        fileName: file.name,
        originalName: file.name,
        filePath: `/uploads/documents/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
        status: 'UPLOADED',
        documentType: data.get('documentType') as string || 'GENERAL',
        caseId: data.get('caseId') as string || null,
        complaintId: data.get('complaintId') as string || null,
        firId: data.get('firId') as string || null,
      }
    })

    // Trigger OCR processing asynchronously
    // In a real implementation, this would be handled by a background job
    // For now, we'll update the status to PROCESSING
    await db.document.update({
      where: { id: document.id },
      data: { status: 'PROCESSING' }
    })

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        status: document.status
      }
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Get document from database
    const document = await db.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update document status to processing
    await db.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' }
    })

    // Get file path
    const filePath = path.join(process.cwd(), document.filePath)
    
    if (!fs.existsSync(filePath)) {
      await db.document.update({
        where: { id: documentId },
        data: { 
          status: 'FAILED',
          error: 'File not found on server'
        }
      })
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read file as base64
    const fileBuffer = fs.readFileSync(filePath)
    const base64File = fileBuffer.toString('base64')

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Perform OCR analysis
      const analysis = await zai.functions.invoke("document_analysis", {
        document_base64: base64File,
        document_type: document.mimeType,
        analysis_type: "ocr_and_content_extraction"
      })

      // Extract text content from analysis
      const extractedText = analysis.extracted_text || ""
      const metadata = analysis.metadata || {}

      // Update document with OCR results
      await db.document.update({
        where: { id: documentId },
        data: {
          status: 'COMPLETED',
          extractedText: extractedText,
          metadata: metadata,
          processedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'OCR processing completed successfully',
        extractedText: extractedText,
        metadata: metadata
      })

    } catch (aiError) {
      console.error('AI OCR processing error:', aiError)
      
      // Update document status to failed
      await db.document.update({
        where: { id: documentId },
        data: { 
          status: 'FAILED',
          error: 'OCR processing failed'
        }
      })

      return NextResponse.json({ 
        error: 'OCR processing failed' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
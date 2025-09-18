import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { FIRStatus } from "@prisma/client"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "POLICE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as string
    const incidentLocation = formData.get("incidentLocation") as string
    const policeStation = formData.get("policeStation") as string
    const district = formData.get("district") as string
    const state = formData.get("state") as string
    const incidentDate = formData.get("incidentDate") as string
    const incidentTime = formData.get("incidentTime") as string
    const aiRecommendations = formData.get("aiRecommendations") as string
    const finalSections = formData.get("finalSections") as string
    
    const files = formData.getAll("files") as File[]

    // Validate required fields
    if (!title || !description || !incidentLocation || !policeStation || !district || !state || !incidentDate) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Generate unique FIR number
    const firNumber = `FIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    // Create FIR
    const fir = await db.fIR.create({
      data: {
        firNumber,
        title,
        description,
        status: FIRStatus.SUBMITTED,
        priority: priority || "MEDIUM",
        incidentLocation,
        policeStation,
        district,
        state,
        incidentDate: new Date(incidentDate),
        filingDate: new Date(),
        investigationStartDate: new Date(),
        recommendedSections: aiRecommendations ? JSON.parse(aiRecommendations) : null,
        finalSections: finalSections ? JSON.parse(finalSections) : null,
        filedById: session.user.id
      }
    })

    // Handle file uploads
    const uploadedDocuments = []
    for (const file of files) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const fileExtension = path.extname(file.name)
        const fileName = `${uuidv4()}${fileExtension}`
        const filePath = path.join(process.cwd(), "uploads", "firs", fileName)

        // Save file
        await writeFile(filePath, buffer)

        // Create document record
        const document = await db.document.create({
          data: {
            filename: fileName,
            originalName: file.name,
            filePath: `/uploads/firs/${fileName}`,
            fileSize: file.size,
            mimeType: file.type,
            type: "EVIDENCE",
            uploadedById: session.user.id,
            firId: fir.id
          }
        })

        uploadedDocuments.push(document)
      }
    }

    // Create timeline entry
    await db.caseTimeline.create({
      data: {
        title: "FIR Filed",
        description: `FIR "${title}" has been filed at ${policeStation}`,
        status: "SUBMITTED",
        firId: fir.id,
        userId: session.user.id
      }
    })

    // Create notification for filing officer
    await db.notification.create({
      data: {
        title: "FIR Created Successfully",
        message: `FIR ${firNumber} has been created and submitted`,
        type: "SUCCESS",
        priority: "MEDIUM",
        userId: session.user.id,
        entityType: "FIR",
        entityId: fir.id
      }
    })

    // If there's an assigned officer, notify them too
    if (session.user.id !== fir.filedById) {
      await db.notification.create({
        data: {
          title: "New FIR Assigned",
          message: `FIR ${firNumber} has been assigned to you for investigation`,
          type: "INFO",
          priority: "MEDIUM",
          userId: fir.filedById,
          entityType: "FIR",
          entityId: fir.id
        }
      })
    }

    return NextResponse.json({
      message: "FIR created successfully",
      fir: {
        id: fir.id,
        firNumber: fir.firNumber,
        title: fir.title,
        status: fir.status,
        createdAt: fir.createdAt
      },
      documents: uploadedDocuments
    })

  } catch (error) {
    console.error("FIR creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "POLICE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { filedById: session.user.id },
        { assignedOfficerId: session.user.id }
      ]
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const [firs, total] = await Promise.all([
      db.fIR.findMany({
        where,
        include: {
          filedBy: {
            select: { name: true, email: true }
          },
          assignedOfficer: {
            select: { name: true, email: true }
          },
          documents: true,
          complaint: true,
          case: true,
          timeline: {
            orderBy: { timestamp: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.fIR.count({ where })
    ])

    return NextResponse.json({
      firs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching FIRs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
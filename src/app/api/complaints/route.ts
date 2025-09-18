import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LegalCategory, ComplaintStatus } from "@prisma/client"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { mkdir } from "fs/promises"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CITIZEN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as LegalCategory
    const priority = formData.get("priority") as string
    const location = formData.get("location") as string
    const incidentDate = formData.get("incidentDate") as string
    const isAnonymous = formData.get("isAnonymous") === "true"
    
    const files = formData.getAll("files") as File[]

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    // Generate unique complaint ID
    const complaintId = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create complaint
    const complaint = await db.complaint.create({
      data: {
        complaintId,
        title,
        description,
        category,
        status: ComplaintStatus.SUBMITTED,
        priority: priority || "MEDIUM",
        location: location || null,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        isAnonymous,
        citizenId: session.user.id
      }
    })

    // Handle file uploads
    const uploadedDocuments = []
    const uploadDir = path.join(process.cwd(), "uploads", "complaints")
    
    // Create upload directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.log("Upload directory already exists or couldn't be created")
    }

    for (const file of files) {
      if (file instanceof File && file.size > 0) {
        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Generate unique filename
          const fileExtension = path.extname(file.name)
          const fileName = `${uuidv4()}${fileExtension}`
          const filePath = path.join(uploadDir, fileName)

          // Save file
          await writeFile(filePath, buffer)

          // Create document record
          const document = await db.document.create({
            data: {
              filename: fileName,
              originalName: file.name,
              filePath: `/uploads/complaints/${fileName}`,
              fileSize: file.size,
              mimeType: file.type,
              type: "EVIDENCE",
              uploadedById: session.user.id,
              complaintId: complaint.id
            }
          })

          uploadedDocuments.push(document)
        } catch (error) {
          console.error("Error uploading file:", error)
          // Continue with other files even if one fails
        }
      }
    }

    // Create timeline entry
    await db.caseTimeline.create({
      data: {
        title: "Complaint Filed",
        description: `Complaint "${title}" has been filed and submitted for review`,
        status: "SUBMITTED",
        complaintId: complaint.id,
        userId: session.user.id
      }
    })

    // Create notification for user
    await db.notification.create({
      data: {
        title: "Complaint Submitted",
        message: `Your complaint "${title}" has been successfully submitted and is under review`,
        type: "SUCCESS",
        priority: "MEDIUM",
        userId: session.user.id,
        entityType: "COMPLAINT",
        entityId: complaint.id
      }
    })

    return NextResponse.json({
      message: "Complaint filed successfully",
      complaint: {
        id: complaint.id,
        complaintId: complaint.complaintId,
        title: complaint.title,
        status: complaint.status,
        createdAt: complaint.createdAt
      },
      documents: uploadedDocuments
    })

  } catch (error) {
    console.error("Complaint filing error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CITIZEN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const skip = (page - 1) * limit

    const where: any = {
      citizenId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        include: {
          documents: true,
          timeline: {
            orderBy: { timestamp: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.complaint.count({ where })
    ])

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
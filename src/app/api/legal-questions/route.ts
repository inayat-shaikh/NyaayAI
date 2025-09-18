import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LegalCategory } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CITIZEN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { question, category, language, isVoice, aiResponse } = await req.json()

    // Validate required fields
    if (!question || !category) {
      return NextResponse.json(
        { error: "Question and category are required" },
        { status: 400 }
      )
    }

    // Create legal question
    const legalQuestion = await db.legalQuestion.create({
      data: {
        question,
        category: category as LegalCategory,
        language: language || "en",
        isVoice: isVoice || false,
        aiResponse: aiResponse || null,
        userId: session.user.id
      }
    })

    // Create notification for user
    await db.notification.create({
      data: {
        title: "Legal Question Submitted",
        message: `Your legal question has been submitted successfully`,
        type: "SUCCESS",
        priority: "LOW",
        userId: session.user.id,
        entityType: "LEGAL_QUESTION",
        entityId: legalQuestion.id
      }
    })

    return NextResponse.json({
      message: "Legal question submitted successfully",
      question: {
        id: legalQuestion.id,
        question: legalQuestion.question,
        category: legalQuestion.category,
        status: "submitted",
        createdAt: legalQuestion.createdAt
      }
    })

  } catch (error) {
    console.error("Legal question submission error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
    const category = searchParams.get("category")

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id
    }

    if (category) {
      where.category = category
    }

    const [questions, total] = await Promise.all([
      db.legalQuestion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.legalQuestion.count({ where })
    ])

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching legal questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
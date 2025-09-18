import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LegalCategory } from "@prisma/client"
import { z } from "zod"
import ZAI from "z-ai-web-dev-sdk"

const legalQASchema = z.object({
  question: z.string().min(1, "Question is required"),
  category: z.nativeEnum(LegalCategory),
  language: z.string().default("en"),
  isVoice: z.boolean().default(false)
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CITIZEN") {
      return NextResponse.json({ error: "Only citizens can ask legal questions" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = legalQASchema.parse(body)

    // Create legal question in database
    const legalQuestion = await db.legalQuestion.create({
      data: {
        question: validatedData.question,
        category: validatedData.category,
        language: validatedData.language,
        isVoice: validatedData.isVoice,
        userId: session.user.id
      }
    })

    // Get AI response using Z-AI SDK
    let aiResponse = null
    try {
      const zai = await ZAI.create()
      
      const systemPrompt = `You are an expert Indian legal assistant. Provide accurate, helpful answers based on Indian laws including the Constitution, IPC, CrPC, and other relevant legislation. Always cite specific sections when possible and explain in simple terms. If you're not certain about something, acknowledge the limitations of your knowledge. Format your response clearly with relevant legal sections and practical advice.`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: validatedData.question
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const answer = completion.choices[0]?.message?.content || ""

      // Extract relevant sections (simplified - in production, use more sophisticated NLP)
      const sections = extractLegalSections(answer, validatedData.category)

      aiResponse = {
        answer,
        sections,
        confidence: 0.85, // Default confidence
        sources: ["Indian Constitution", "IPC", "CrPC", "Relevant State Laws"]
      }

      // Update the legal question with AI response
      await db.legalQuestion.update({
        where: { id: legalQuestion.id },
        data: {
          answer,
          aiResponse,
          confidence: 0.85
        }
      })
    } catch (aiError) {
      console.error("AI processing error:", aiError)
      // Fallback response if AI fails
      aiResponse = {
        answer: "I apologize, but I'm currently unable to process your question. Please try again later or consult with a qualified legal professional.",
        sections: [],
        confidence: 0.0,
        sources: []
      }
    }

    // Create notification for user
    await db.notification.create({
      data: {
        title: "Legal Question Answered",
        message: `Your question "${validatedData.question.substring(0, 50)}..." has been answered by our AI assistant.`,
        type: "SUCCESS",
        priority: "MEDIUM",
        userId: session.user.id,
        entityType: "LEGAL_QUESTION",
        entityId: legalQuestion.id
      }
    })

    return NextResponse.json({
      message: "Question submitted successfully",
      legalQuestion: {
        id: legalQuestion.id,
        question: legalQuestion.question,
        category: legalQuestion.category,
        createdAt: legalQuestion.createdAt
      },
      aiResponse
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Legal Q&A error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CITIZEN") {
      return NextResponse.json({ error: "Only citizens can view legal questions" }, { status: 403 })
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
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
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
    console.error("Legal Q&A fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to extract legal sections from AI response
function extractLegalSections(answer: string, category: LegalCategory) {
  // This is a simplified implementation
  // In production, use more sophisticated NLP techniques
  
  const sections = []
  
  // Common sections based on category
  const categorySections: Record<LegalCategory, string[]> = {
    [LegalCategory.CONSTITUTIONAL]: [
      "Article 14 - Right to Equality",
      "Article 19 - Right to Freedom",
      "Article 21 - Right to Life and Personal Liberty"
    ],
    [LegalCategory.CRIMINAL]: [
      "Section 299 IPC - Culpable Homicide",
      "Section 300 IPC - Murder",
      "Section 376 IPC - Rape"
    ],
    [LegalCategory.CIVIL]: [
      "Order VII CPC - Plaint",
      "Order VIII CPC - Written Statement",
      "Section 9 CPC - Courts to try all civil suits"
    ],
    [LegalCategory.FAMILY]: [
      "Section 13 Hindu Marriage Act - Divorce",
      "Section 125 CrPC - Maintenance",
      "Domestic Violence Act - Protection Orders"
    ],
    [LegalCategory.PROPERTY]: [
      "Transfer of Property Act - Sale of Property",
      "Rent Control Acts - Tenant Rights",
      "Easement Act - Right to Way"
    ],
    [LegalCategory.LABOR]: [
      "Payment of Wages Act - Timely Payment",
      "Factories Act - Working Conditions",
      "Maternity Benefit Act - Leave Entitlement"
    ],
    [LegalCategory.TAXATION]: [
      "Income Tax Act - Taxable Income",
      "GST Act - Goods and Services Tax",
      "Wealth Tax Act - Asset Taxation"
    ],
    [LegalCategory.CORPORATE]: [
      "Companies Act - Director Responsibilities",
      "SEBI Regulations - Stock Market",
      "Insolvency and Bankruptcy Code - Resolution"
    ],
    [LegalCategory.CONSUMER]: [
      "Consumer Protection Act - Defective Goods",
      "MRTP Act - Unfair Trade Practices",
      "ADR Mechanisms - Dispute Resolution"
    ],
    [LegalCategory.ENVIRONMENTAL]: [
      "Environment Protection Act - Pollution Control",
      "Water Act - Water Pollution",
      "Air Act - Air Quality Standards"
    ],
    [LegalCategory.OTHER]: []
  }

  const relevantSections = categorySections[category] || []
  
  // Add sections that are mentioned in the answer
  relevantSections.forEach(section => {
    if (answer.toLowerCase().includes(section.toLowerCase().split(" - ")[0])) {
      sections.push({
        section: section.split(" - ")[0],
        description: section.split(" - ")[1]
      })
    }
  })

  return sections.slice(0, 5) // Limit to 5 sections
}
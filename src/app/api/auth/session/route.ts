import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth-session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      )
    }

    // Decode session token
    let sessionData
    try {
      sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    // Check if session is expired (30 days)
    if (Date.now() - sessionData.timestamp > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      )
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: sessionData.userId },
      include: { profile: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        courtId: user.courtId,
        profile: user.profile
      }
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-session')
  return response
}
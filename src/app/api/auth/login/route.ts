import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('=== CUSTOM AUTH DEBUG: Login attempt ===')
    console.log('Email:', email)
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user) {
      console.log('CUSTOM AUTH DEBUG: User not found')
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      console.log('CUSTOM AUTH DEBUG: User not active')
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('CUSTOM AUTH DEBUG: Invalid password')
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log('CUSTOM AUTH DEBUG: Authentication successful')
    console.log('CUSTOM AUTH DEBUG: User role:', user.role)

    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Create session token (simple implementation)
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    })).toString('base64')

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        courtId: user.courtId,
        profile: user.profile
      },
      sessionToken
    })

    // Set session cookie
    response.cookies.set('auth-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response

  } catch (error) {
    console.error('CUSTOM AUTH DEBUG: Login error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
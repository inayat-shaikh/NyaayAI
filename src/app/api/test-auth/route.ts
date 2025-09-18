import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing auth for:', email)
    
    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true }
    })
    
    if (!user) {
      console.log('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (!user.isActive) {
      console.log('User not active')
      return NextResponse.json({ error: 'User not active' }, { status: 401 })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Invalid password')
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    console.log('Auth successful')
    
    return NextResponse.json({
      success: true,
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
    console.error('Auth test error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
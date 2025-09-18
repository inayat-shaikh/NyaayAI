import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      type, 
      description, 
      location, 
      coordinates, 
      urgency = 'HIGH',
      contactInfo 
    } = await request.json()

    if (!type || !description || !location) {
      return NextResponse.json({ 
        error: 'Type, description, and location are required' 
      }, { status: 400 })
    }

    // Create SOS request
    const sosRequest = await db.sOSRequest.create({
      data: {
        type,
        description,
        location,
        coordinates,
        urgency,
        contactInfo,
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    // Get user location for nearby legal aid
    const userLocation = coordinates || { lat: 28.6139, lng: 77.2090 } // Default to Delhi

    try {
      // Initialize ZAI SDK for legal assistance
      const zai = await ZAI.create()

      // Get immediate legal advice
      const legalAdvice = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an emergency legal assistant for India. Provide immediate, actionable legal advice for emergency situations. Focus on:
            1. Immediate steps the person should take
            2. Their legal rights in this situation
            3. Emergency contacts and resources
            4. What evidence to preserve
            5. Next legal steps
            
            Be concise, practical, and provide specific Indian legal references when applicable.`
          },
          {
            role: 'user',
            content: `EMERGENCY LEGAL SOS - Type: ${type}
            
            Situation: ${description}
            Location: ${location}
            Urgency: ${urgency}
            
            Provide immediate legal advice and action steps.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      const advice = legalAdvice.choices[0]?.message?.content || 
        'Stay calm and contact local authorities. Your legal rights are protected under Indian law.'

      // Update SOS request with AI advice
      await db.sOSRequest.update({
        where: { id: sosRequest.id },
        data: {
          aiResponse: advice,
          status: 'RESPONDED'
        }
      })

      // Create notification for the user
      await db.notification.create({
        data: {
          title: 'Legal SOS Response',
          message: 'Your emergency legal assistance request has been responded to',
          type: 'EMERGENCY',
          priority: 'URGENT',
          userId: session.user.id,
          sosRequestId: sosRequest.id
        }
      })

      // Find nearby legal aid providers (in a real system, this would query a database)
      const nearbyHelp = [
        {
          type: 'Police Station',
          name: 'Local Police Station',
          distance: '2.5 km',
          phone: '100',
          address: 'Nearby police station'
        },
        {
          type: 'Legal Aid',
          name: 'District Legal Services Authority',
          distance: '5.0 km',
          phone: '1516',
          address: 'District Court Complex'
        },
        {
          type: 'Hospital',
          name: 'Government Hospital',
          distance: '3.0 km',
          phone: '108',
          address: 'Main hospital in area'
        }
      ]

      return NextResponse.json({
        message: 'SOS request processed successfully',
        sosRequest: {
          id: sosRequest.id,
          status: sosRequest.status,
          createdAt: sosRequest.createdAt
        },
        advice,
        nearbyHelp,
        emergencyContacts: {
          police: '100',
          ambulance: '108',
          womenHelpline: '1091',
          childHelpline: '1098',
          legalAid: '1516'
        }
      })

    } catch (aiError) {
      console.error('AI SOS processing error:', aiError)
      
      // Still return SOS request even if AI fails
      return NextResponse.json({
        message: 'SOS request created. AI assistance temporarily unavailable.',
        sosRequest: {
          id: sosRequest.id,
          status: sosRequest.status,
          createdAt: sosRequest.createdAt
        },
        emergencyContacts: {
          police: '100',
          ambulance: '108',
          womenHelpline: '1091',
          childHelpline: '1098',
          legalAid: '1516'
        }
      })
    }

  } catch (error) {
    console.error('SOS request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      db.sOSRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.sOSRequest.count({ where })
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('SOS fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
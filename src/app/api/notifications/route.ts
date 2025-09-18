import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true
            }
          },
          complaint: {
            select: {
              id: true,
              title: true
            }
          },
          fir: {
            select: {
              id: true,
              firNumber: true,
              title: true
            }
          }
        }
      }),
      db.notification.count({ where })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, message, type, priority, caseId, complaintId, firId } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ 
        error: 'Title and message are required' 
      }, { status: 400 })
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type || 'INFO',
        priority: priority || 'MEDIUM',
        userId: session.user.id,
        caseId,
        complaintId,
        firId
      }
    })

    // Emit real-time notification via Socket.IO
    try {
      const { getIO } = await import('@/lib/socket')
      const io = getIO()
      if (io) {
        io.to(`user:${session.user.id}`).emit('notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          createdAt: notification.createdAt
        })
      }
    } catch (socketError) {
      console.log('Socket.IO not available for notification:', socketError.message)
    }

    return NextResponse.json({ 
      message: 'Notification created successfully',
      notification 
    })

  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, action } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds) || !action) {
      return NextResponse.json({ 
        error: 'Notification IDs and action are required' 
      }, { status: 400 })
    }

    let updateData = {}

    switch (action) {
      case 'markRead':
        updateData = { isRead: true, readAt: new Date() }
        break
      case 'markUnread':
        updateData = { isRead: false, readAt: null }
        break
      case 'delete':
        await db.notification.deleteMany({
          where: {
            id: { in: notificationIds },
            userId: session.user.id
          }
        })
        return NextResponse.json({ 
          message: 'Notifications deleted successfully' 
        })
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 })
    }

    await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: updateData
    })

    return NextResponse.json({ 
      message: `Notifications ${action} successfully` 
    })

  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
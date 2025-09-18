import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, entityType, entityId, data } = await request.json()

    if (!action || !entityType || !entityId) {
      return NextResponse.json({ 
        error: 'Action, entity type, and entity ID are required' 
      }, { status: 400 })
    }

    // Verify user has permission to perform this action
    const userRole = session.user.role
    const userId = session.user.id

    let result
    let notifications = []

    switch (action) {
      case 'APPROVE_COMPLAINT':
        // Only police and admin can approve complaints
        if (!['POLICE', 'ADMIN'].includes(userRole)) {
          return NextResponse.json({ 
            error: 'Insufficient permissions' 
          }, { status: 403 })
        }

        const complaint = await db.complaint.update({
          where: { id: entityId },
          data: { 
            status: 'APPROVED',
            approvedBy: userId,
            approvedAt: new Date()
          }
        })

        // Create FIR from approved complaint
        const fir = await db.fIR.create({
          data: {
            title: complaint.title,
            description: complaint.description,
            complaintId: complaint.id,
            filedBy: userId,
            status: 'DRAFT',
            priority: complaint.priority,
            category: complaint.category,
            location: complaint.location,
            jurisdiction: complaint.jurisdiction
          }
        })

        // Notify citizen
        notifications.push({
          title: 'Complaint Approved',
          message: 'Your complaint has been approved and FIR has been initiated',
          type: 'SUCCESS',
          priority: 'MEDIUM',
          userId: complaint.userId,
          complaintId: complaint.id,
          firId: fir.id
        })

        result = { complaint, fir }
        break

      case 'CONVERT_FIR_TO_CASE':
        // Only police and admin can convert FIR to case
        if (!['POLICE', 'ADMIN'].includes(userRole)) {
          return NextResponse.json({ 
            error: 'Insufficient permissions' 
          }, { status: 403 })
        }

        const firData = await db.fIR.findUnique({
          where: { id: entityId },
          include: { complaint: true }
        })

        if (!firData) {
          return NextResponse.json({ 
            error: 'FIR not found' 
          }, { status: 404 })
        }

        const newCase = await db.case.create({
          data: {
            title: firData.title,
            description: firData.description,
            firId: firData.id,
            complaintId: firData.complaintId,
            plaintiff: 'State', // In real system, this would be determined
            defendant: 'Accused', // In real system, this would be determined
            status: 'PENDING',
            priority: firData.priority,
            category: firData.category,
            courtId: data?.courtId // Optional court assignment
          }
        })

        // Update FIR status
        await db.fIR.update({
          where: { id: entityId },
          data: { 
            status: 'CONVERTED_TO_CASE',
            caseId: newCase.id
          }
        })

        // Notify relevant parties
        notifications.push({
          title: 'Case Created',
          message: 'A new case has been created from your FIR',
          type: 'INFO',
          priority: 'MEDIUM',
          userId: firData.complaint?.userId,
          firId: firData.id,
          caseId: newCase.id
        })

        result = { fir: firData, case: newCase }
        break

      case 'SCHEDULE_HEARING':
        // Only judges and court staff can schedule hearings
        if (!['JUDGE', 'COURT_STAFF', 'ADMIN'].includes(userRole)) {
          return NextResponse.json({ 
            error: 'Insufficient permissions' 
          }, { status: 403 })
        }

        const hearing = await db.hearing.create({
          data: {
            caseId: entityId,
            date: data.date,
            time: data.time,
            type: data.type || 'REGULAR',
            judgeId: data.judgeId,
            courtroom: data.courtroom,
            status: 'SCHEDULED',
            scheduledBy: userId
          }
        })

        // Update case status
        await db.case.update({
          where: { id: entityId },
          data: { 
            status: 'HEARING',
            nextHearingDate: data.date
          }
        })

        // Get case details for notifications
        const caseDetails = await db.case.findUnique({
          where: { id: entityId },
          include: {
            fir: {
              include: { complaint: true }
            }
          }
        })

        // Notify citizen
        if (caseDetails?.fir?.complaint?.userId) {
          notifications.push({
            title: 'Hearing Scheduled',
            message: `A hearing has been scheduled for your case on ${data.date}`,
            type: 'INFO',
            priority: 'HIGH',
            userId: caseDetails.fir.complaint.userId,
            caseId: entityId,
            hearingId: hearing.id
          })
        }

        result = { hearing }
        break

      case 'RECORD_JUDGMENT':
        // Only judges can record judgments
        if (userRole !== 'JUDGE') {
          return NextResponse.json({ 
            error: 'Insufficient permissions' 
          }, { status: 403 })
        }

        const judgment = await db.judgment.create({
          data: {
            caseId: entityId,
            summary: data.summary,
            decision: data.decision,
            reasoning: data.reasoning,
            judgeId: userId,
            status: 'PUBLISHED'
          }
        })

        // Update case status
        await db.case.update({
          where: { id: entityId },
          data: { 
            status: 'CLOSED',
            closedAt: new Date(),
            judgmentId: judgment.id
          }
        })

        // Get case details for notifications
        const closedCase = await db.case.findUnique({
          where: { id: entityId },
          include: {
            fir: {
              include: { complaint: true }
            }
          }
        })

        // Notify citizen
        if (closedCase?.fir?.complaint?.userId) {
          notifications.push({
            title: 'Judgment Delivered',
            message: `A judgment has been delivered in your case: ${data.decision}`,
            type: 'SUCCESS',
            priority: 'HIGH',
            userId: closedCase.fir.complaint.userId,
            caseId: entityId,
            judgmentId: judgment.id
          })
        }

        result = { judgment }
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 })
    }

    // Create all notifications
    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications
      })

      // Emit real-time notifications via Socket.IO
      try {
        const { getIO } = await import('@/lib/socket')
        const io = getIO()
        if (io) {
          notifications.forEach(notification => {
            io.to(`user:${notification.userId}`).emit('notification', {
              id: Math.random().toString(36).substr(2, 9),
              title: notification.title,
              message: notification.message,
              type: notification.type,
              priority: notification.priority,
              createdAt: new Date().toISOString()
            })
          })
        }
      } catch (socketError) {
        console.log('Socket.IO not available for workflow notifications:', socketError.message)
      }
    }

    // Log workflow action
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: JSON.stringify(data),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Workflow action completed successfully',
      result,
      notificationsCreated: notifications.length
    })

  } catch (error) {
    console.error('Workflow action error:', error)
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
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json({ 
        error: 'Entity type and ID are required' 
      }, { status: 400 })
    }

    // Get workflow history for the entity
    let workflowHistory = []

    switch (entityType) {
      case 'complaint':
        workflowHistory = await db.auditLog.findMany({
          where: {
            entityType: 'complaint',
            entityId: entityId
          },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        })
        break

      case 'fir':
        workflowHistory = await db.auditLog.findMany({
          where: {
            OR: [
              { entityType: 'fir', entityId: entityId },
              { entityType: 'complaint', entityId: entityId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        })
        break

      case 'case':
        // Get related FIR and complaint history too
        const caseData = await db.case.findUnique({
          where: { id: entityId },
          include: {
            fir: true
          }
        })

        if (caseData) {
          const relatedIds = [entityId]
          if (caseData.firId) relatedIds.push(caseData.firId)
          if (caseData.fir?.complaintId) relatedIds.push(caseData.fir.complaintId)

          workflowHistory = await db.auditLog.findMany({
            where: {
              OR: [
                { entityType: 'case', entityId: { in: relatedIds } },
                { entityType: 'fir', entityId: { in: relatedIds } },
                { entityType: 'complaint', entityId: { in: relatedIds } }
              ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          })
        }
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid entity type' 
        }, { status: 400 })
    }

    return NextResponse.json({
      workflowHistory
    })

  } catch (error) {
    console.error('Workflow history fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
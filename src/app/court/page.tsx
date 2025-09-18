"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Gavel, 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  LogOut
} from "lucide-react"
import { useAuthContext } from "@/contexts/AuthContext"

interface Case {
  id: string
  caseNumber: string
  title: string
  status: 'PENDING' | 'HEARING' | 'JUDGMENT' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  nextHearing?: string
  filedDate: string
  plaintiff: string
  defendant: string
  court: string
}

interface Hearing {
  id: string
  caseId: string
  caseTitle: string
  date: string
  time: string
  type: 'REGULAR' | 'URGENT' | 'FINAL' | 'REVIEW'
  judge: string
  courtroom: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED'
}

const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'C-2024-001',
    title: 'State vs. John Doe - Theft Case',
    status: 'HEARING',
    priority: 'HIGH',
    nextHearing: '2024-01-15',
    filedDate: '2024-01-01',
    plaintiff: 'State of Delhi',
    defendant: 'John Doe',
    court: 'Delhi High Court'
  },
  {
    id: '2',
    caseNumber: 'C-2024-002',
    title: 'Property Dispute - Smith vs. Johnson',
    status: 'PENDING',
    priority: 'MEDIUM',
    nextHearing: '2024-01-20',
    filedDate: '2024-01-05',
    plaintiff: 'Mr. Smith',
    defendant: 'Mr. Johnson',
    court: 'Delhi High Court'
  },
  {
    id: '3',
    caseNumber: 'C-2024-003',
    title: 'Contract Breach - ABC Corp vs. XYZ Ltd',
    status: 'JUDGMENT',
    priority: 'URGENT',
    nextHearing: '2024-01-10',
    filedDate: '2024-01-03',
    plaintiff: 'ABC Corporation',
    defendant: 'XYZ Limited',
    court: 'Delhi High Court'
  }
]

const mockHearings: Hearing[] = [
  {
    id: '1',
    caseId: '1',
    caseTitle: 'State vs. John Doe - Theft Case',
    date: '2024-01-15',
    time: '10:00 AM',
    type: 'REGULAR',
    judge: 'Honorable Judge Sharma',
    courtroom: 'Courtroom 101',
    status: 'SCHEDULED'
  },
  {
    id: '2',
    caseId: '2',
    caseTitle: 'Property Dispute - Smith vs. Johnson',
    date: '2024-01-20',
    time: '2:00 PM',
    type: 'REGULAR',
    judge: 'Honorable Judge Verma',
    courtroom: 'Courtroom 102',
    status: 'SCHEDULED'
  },
  {
    id: '3',
    caseId: '3',
    caseTitle: 'Contract Breach - ABC Corp vs. XYZ Ltd',
    date: '2024-01-10',
    time: '11:30 AM',
    type: 'URGENT',
    judge: 'Honorable Judge Patel',
    courtroom: 'Courtroom 103',
    status: 'SCHEDULED'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'HEARING': return 'bg-blue-100 text-blue-800'
    case 'JUDGMENT': return 'bg-purple-100 text-purple-800'
    case 'CLOSED': return 'bg-green-100 text-green-800'
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'POSTPONED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'bg-green-100 text-green-800'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
    case 'HIGH': return 'bg-orange-100 text-orange-800'
    case 'URGENT': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function CourtDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { logout } = useAuthContext()
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [hearings, setHearings] = useState<Hearing[]>(mockHearings)
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = async () => {
    await logout()
    router.push("/auth/signin")
  }

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "JUDGE" && session.user.role !== "COURT_STAFF") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = {
    totalCases: cases.length,
    pendingCases: cases.filter(c => c.status === 'PENDING').length,
    hearingCases: cases.filter(c => c.status === 'HEARING').length,
    judgmentCases: cases.filter(c => c.status === 'JUDGMENT').length,
    todayHearings: hearings.filter(h => h.date === new Date().toISOString().split('T')[0]).length,
    urgentCases: cases.filter(c => c.priority === 'URGENT').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gavel className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Court Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {session.user.name} ({session.user.role === 'JUDGE' ? 'Judge' : 'Court Staff'})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Cases
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="hearings">Hearings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCases}</div>
                  <p className="text-xs text-muted-foreground">
                    Active cases under your jurisdiction
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Hearings</CardTitle>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayHearings}</div>
                  <p className="text-xs text-muted-foreground">
                    Hearings scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.urgentCases}</div>
                  <p className="text-xs text-muted-foreground">
                    Cases requiring immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Case Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Case Status Distribution</CardTitle>
                  <CardDescription>Overview of current case statuses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Cases</span>
                    <Badge className={getStatusColor('PENDING')}>
                      {stats.pendingCases}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Under Hearing</span>
                    <Badge className={getStatusColor('HEARING')}>
                      {stats.hearingCases}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Judgment Phase</span>
                    <Badge className={getStatusColor('JUDGMENT')}>
                      {stats.judgmentCases}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Hearings</CardTitle>
                  <CardDescription>Next 5 scheduled hearings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hearings.slice(0, 5).map((hearing) => (
                    <div key={hearing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{hearing.caseTitle}</p>
                        <p className="text-xs text-gray-600">{hearing.date} at {hearing.time}</p>
                      </div>
                      <Badge className={getStatusColor(hearing.status)}>
                        {hearing.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>Manage and track all cases</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Case
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases.map((case_item) => (
                    <div key={case_item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{case_item.title}</h3>
                          <p className="text-sm text-gray-600">Case No: {case_item.caseNumber}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(case_item.status)}>
                            {case_item.status}
                          </Badge>
                          <Badge className={getPriorityColor(case_item.priority)}>
                            {case_item.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Plaintiff:</span> {case_item.plaintiff}
                        </div>
                        <div>
                          <span className="font-medium">Defendant:</span> {case_item.defendant}
                        </div>
                        <div>
                          <span className="font-medium">Court:</span> {case_item.court}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Filed:</span> {case_item.filedDate}
                          {case_item.nextHearing && (
                            <span className="ml-4">
                              <span className="font-medium">Next Hearing:</span> {case_item.nextHearing}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hearings Tab */}
          <TabsContent value="hearings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Hearings Schedule</CardTitle>
                    <CardDescription>Manage all court hearings</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Hearing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hearings.map((hearing) => (
                    <div key={hearing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{hearing.caseTitle}</h3>
                          <p className="text-sm text-gray-600">
                            {hearing.date} at {hearing.time} | {hearing.courtroom}
                          </p>
                        </div>
                        <Badge className={getStatusColor(hearing.status)}>
                          {hearing.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Judge:</span> {hearing.judge}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {hearing.type}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          Postpone
                        </Button>
                        <Button size="sm">
                          Start Hearing
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Court Schedule</CardTitle>
                <CardDescription>View and manage your court schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
                  <p className="text-gray-600 mb-4">
                    Interactive calendar to view and manage court schedule
                  </p>
                  <Button>
                    View Full Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
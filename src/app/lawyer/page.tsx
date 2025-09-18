"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  LogOut
} from "lucide-react"
import { useAuthContext } from "@/contexts/AuthContext"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  caseCount: number
  joinedDate: string
}

interface Case {
  id: string
  caseNumber: string
  title: string
  clientName: string
  status: 'PENDING' | 'HEARING' | 'JUDGMENT' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  nextHearing?: string
  filedDate: string
  court: string
  description: string
}

interface Appointment {
  id: string
  clientName: string
  date: string
  time: string
  type: 'CONSULTATION' | 'HEARING' | 'MEETING' | 'REVIEW'
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  location: string
  notes?: string
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+91-9876543210',
    status: 'ACTIVE',
    caseCount: 2,
    joinedDate: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+91-9876543211',
    status: 'ACTIVE',
    caseCount: 1,
    joinedDate: '2024-01-05'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@email.com',
    phone: '+91-9876543212',
    status: 'PENDING',
    caseCount: 0,
    joinedDate: '2024-01-10'
  }
]

const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'C-2024-001',
    title: 'Property Dispute - Residential',
    clientName: 'John Smith',
    status: 'HEARING',
    priority: 'HIGH',
    nextHearing: '2024-01-15',
    filedDate: '2024-01-01',
    court: 'Delhi High Court',
    description: 'Dispute regarding property ownership and boundaries'
  },
  {
    id: '2',
    caseNumber: 'C-2024-002',
    title: 'Contract Breach - Services',
    clientName: 'Sarah Johnson',
    status: 'PENDING',
    priority: 'MEDIUM',
    nextHearing: '2024-01-20',
    filedDate: '2024-01-05',
    court: 'Delhi High Court',
    description: 'Breach of service contract between two parties'
  },
  {
    id: '3',
    caseNumber: 'C-2024-003',
    title: 'Employment Dispute',
    clientName: 'John Smith',
    status: 'JUDGMENT',
    priority: 'URGENT',
    nextHearing: '2024-01-10',
    filedDate: '2024-01-03',
    court: 'Delhi High Court',
    description: 'Wrongful termination and compensation claim'
  }
]

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'John Smith',
    date: '2024-01-15',
    time: '10:00 AM',
    type: 'HEARING',
    status: 'SCHEDULED',
    location: 'Delhi High Court - Courtroom 101',
    notes: 'Property dispute hearing'
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    date: '2024-01-16',
    time: '2:00 PM',
    type: 'CONSULTATION',
    status: 'SCHEDULED',
    location: 'Office',
    notes: 'Initial consultation for contract breach case'
  },
  {
    id: '3',
    clientName: 'Mike Wilson',
    date: '2024-01-17',
    time: '11:00 AM',
    type: 'MEETING',
    status: 'SCHEDULED',
    location: 'Office',
    notes: 'Case evaluation and strategy discussion'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'HEARING': return 'bg-blue-100 text-blue-800'
    case 'JUDGMENT': return 'bg-purple-100 text-purple-800'
    case 'CLOSED': return 'bg-green-100 text-green-800'
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'INACTIVE': return 'bg-red-100 text-red-800'
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
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

const getAppointmentTypeColor = (type: string) => {
  switch (type) {
    case 'CONSULTATION': return 'bg-blue-100 text-blue-800'
    case 'HEARING': return 'bg-purple-100 text-purple-800'
    case 'MEETING': return 'bg-green-100 text-green-800'
    case 'REVIEW': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function LawyerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { logout } = useAuthContext()
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
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
    if (session.user.role !== "LAWYER") {
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
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'ACTIVE').length,
    totalCases: cases.length,
    pendingCases: cases.filter(c => c.status === 'PENDING').length,
    todayAppointments: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
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
                <Briefcase className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Lawyer Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {session.user.name} (Advocate)
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
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeClients} active clients
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCases}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingCases} pending cases
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    Appointments scheduled
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Cases</CardTitle>
                  <CardDescription>Your most recent case updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cases.slice(0, 4).map((case_item) => (
                    <div key={case_item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{case_item.title}</p>
                        <p className="text-xs text-gray-600">{case_item.clientName}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getStatusColor(case_item.status)} variant="secondary">
                          {case_item.status}
                        </Badge>
                        <Badge className={getPriorityColor(case_item.priority)} variant="secondary">
                          {case_item.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your next scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.clientName}</p>
                        <p className="text-xs text-gray-600">{appointment.date} at {appointment.time}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getAppointmentTypeColor(appointment.type)} variant="secondary">
                          {appointment.type}
                        </Badge>
                        <Badge className={getStatusColor(appointment.status)} variant="secondary">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>Manage your client portfolio</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{client.name}</h3>
                          <p className="text-sm text-gray-600">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {client.email} | <Phone className="h-3 w-3 inline mr-1" /> {client.phone}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                          <Badge variant="outline">
                            {client.caseCount} cases
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Client Since:</span> {client.joinedDate}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cases</CardTitle>
                    <CardDescription>Manage all your legal cases</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
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
                          <p className="text-sm text-gray-600">Client: {case_item.clientName}</p>
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
                      <p className="text-sm text-gray-700 mb-3">{case_item.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Court:</span> {case_item.court}
                        </div>
                        <div>
                          <span className="font-medium">Filed:</span> {case_item.filedDate}
                        </div>
                      </div>
                      {case_item.nextHearing && (
                        <div className="text-sm text-blue-600 mb-3">
                          <span className="font-medium">Next Hearing:</span> {case_item.nextHearing}
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Manage Case
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage your schedule and client meetings</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{appointment.clientName}</h3>
                          <p className="text-sm text-gray-600">
                            {appointment.date} at {appointment.time} | {appointment.location}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getAppointmentTypeColor(appointment.type)}>
                            {appointment.type}
                          </Badge>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      )}
                      <div className="flex justify-end space-x-2 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Client
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        {appointment.status === 'SCHEDULED' && (
                          <Button size="sm">
                            Start Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
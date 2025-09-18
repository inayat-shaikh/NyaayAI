"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  FileText, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Search,
  TrendingUp,
  CheckCircle,
  Eye,
  Plus,
  MapPin,
  Calendar,
  Users,
  Target,
  BarChart3,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"

// Mock data for demonstration
const mockFIRs = [
  {
    id: "1",
    firNumber: "FIR/2024/001",
    title: "Theft Investigation",
    description: "Report of theft from residential property",
    status: "UNDER_INVESTIGATION",
    priority: "HIGH",
    incidentLocation: "Sector 15, Noida",
    policeStation: "Sector 20 Police Station",
    incidentDate: "2024-01-14",
    filingDate: "2024-01-15"
  },
  {
    id: "2", 
    firNumber: "FIR/2024/002",
    title: "Assault Case",
    description: "Physical assault reported near market area",
    status: "SUBMITTED",
    priority: "URGENT",
    incidentLocation: "Connaught Place, New Delhi",
    policeStation: "Connaught Place Police Station",
    incidentDate: "2024-01-16",
    filingDate: "2024-01-16"
  }
]

const mockComplaints = [
  {
    id: "1",
    complaintId: "COMP-2024-001",
    title: "Property Dispute",
    description: "Dispute regarding property ownership",
    status: "UNDER_REVIEW",
    category: "PROPERTY",
    priority: "MEDIUM",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    complaintId: "COMP-2024-002", 
    title: "Harassment Complaint",
    description: "Workplace harassment reported",
    status: "SUBMITTED",
    category: "CRIMINAL",
    priority: "HIGH",
    createdAt: "2024-01-16"
  }
]

const mockCases = [
  {
    id: "1",
    caseNumber: "CASE/2024/001",
    title: "State vs. John Doe",
    description: "Theft case under investigation",
    status: "IN_PROGRESS",
    court: "District Court, Noida",
    nextHearing: "2024-01-25"
  }
]

const mockNotifications = [
  {
    id: "1",
    title: "New Complaint Assigned",
    message: "Property dispute complaint assigned to your jurisdiction",
    type: "INFO",
    priority: "MEDIUM",
    isRead: false,
    createdAt: "2024-01-16"
  },
  {
    id: "2",
    title: "FIR Status Update",
    message: "FIR/2024/001 requires your attention",
    type: "WARNING",
    priority: "HIGH",
    isRead: false,
    createdAt: "2024-01-16"
  }
]

export default function PoliceDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { logout } = useAuthContext()
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
    if (session.user.role !== "POLICE") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "SUBMITTED": return "bg-blue-100 text-blue-800"
      case "UNDER_INVESTIGATION": return "bg-yellow-100 text-yellow-800"
      case "CHARGESHEET_FILED": return "bg-purple-100 text-purple-800"
      case "CLOSED": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "URGENT": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Police Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, Officer {session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New FIR
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active FIRs</p>
                  <p className="text-2xl font-bold text-gray-900">{mockFIRs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{mockComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Under Investigation</p>
                  <p className="text-2xl font-bold text-gray-900">{mockFIRs.filter(f => f.status === "UNDER_INVESTIGATION").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cases in Court</p>
                  <p className="text-2xl font-bold text-gray-900">{mockCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="firs">FIRs</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockFIRs.slice(0, 2).map((fir) => (
                        <div key={fir.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{fir.title}</h4>
                            <p className="text-sm text-gray-600">{fir.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(fir.status)}>
                                {fir.status}
                              </Badge>
                              <Badge className={getPriorityColor(fir.priority)}>
                                {fir.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{fir.firNumber}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/police/firs/new">
                        <Button className="w-full" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New FIR
                        </Button>
                      </Link>
                      <Link href="/police/complaints">
                        <Button className="w-full" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Review Complaints
                        </Button>
                      </Link>
                      <Link href="/police/investigations">
                        <Button className="w-full" variant="outline">
                          <Target className="h-4 w-4 mr-2" />
                          Manage Investigations
                        </Button>
                      </Link>
                      <Link href="/police/analytics">
                        <Button className="w-full" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="firs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My FIRs</CardTitle>
                      <Link href="/police/firs/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New FIR
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockFIRs.map((fir) => (
                        <div key={fir.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{fir.title}</h4>
                              <p className="text-gray-600 mt-1">{fir.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(fir.status)}>
                                  {fir.status}
                                </Badge>
                                <Badge className={getPriorityColor(fir.priority)}>
                                  {fir.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {fir.incidentLocation}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {fir.incidentDate}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{fir.firNumber}</p>
                              <p className="text-sm text-gray-500">{fir.policeStation}</p>
                              <Button variant="outline" size="sm" className="mt-2">
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

              <TabsContent value="complaints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Complaints</CardTitle>
                    <CardDescription>
                      Complaints assigned to your jurisdiction for review and potential FIR conversion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockComplaints.map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">{complaint.title}</h4>
                                <Badge className={getPriorityColor(complaint.priority)}>
                                  {complaint.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mt-1">{complaint.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(complaint.status)}>
                                  {complaint.status}
                                </Badge>
                                <Badge variant="outline">{complaint.category}</Badge>
                                <span className="text-sm text-gray-500">{complaint.complaintId}</span>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col space-y-2">
                              <Button variant="outline" size="sm">
                                Review
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Convert to FIR
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cases" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Court Cases</CardTitle>
                    <CardDescription>
                      Cases that have been filed in court based on your FIRs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCases.map((case_) => (
                        <div key={case_.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{case_.title}</h4>
                              <p className="text-gray-600 mt-1">{case_.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(case_.status)}>
                                  {case_.status}
                                </Badge>
                                <span className="text-sm text-gray-500">{case_.caseNumber}</span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {case_.court}
                                </div>
                                {case_.nextHearing && (
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Next Hearing: {case_.nextHearing}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Button variant="outline" size="sm" className="mt-2">
                                Track Case
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                          <p className="text-gray-500 text-xs mt-1">{notification.createdAt}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Jurisdiction Info */}
            <Card>
              <CardHeader>
                <CardTitle>Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 bg-blue-50 rounded">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">Police Station</p>
                      <p className="text-blue-600 text-sm">Sector 20, Noida</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <Users className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">Assigned Area</p>
                      <p className="text-green-600 text-sm">Sectors 15-25, Noida</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">FIRs Filed</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Complaints Reviewed</span>
                    <span className="font-semibold">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cases Solved</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conviction Rate</span>
                    <span className="font-semibold">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Legal References</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/legal/ipc" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Indian Penal Code</span>
                  </Link>
                  <Link href="/legal/crpc" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Code of Criminal Procedure</span>
                  </Link>
                  <Link href="/legal/evidence" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Indian Evidence Act</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
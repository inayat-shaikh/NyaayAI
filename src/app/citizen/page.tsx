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
  FileText, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Search,
  TrendingUp,
  CheckCircle,
  Eye,
  Plus,
  Phone,
  MapPin,
  Calendar,
  User,
  Scale,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"

// Mock data for demonstration
const mockComplaints = [
  {
    id: "1",
    title: "Property Dispute",
    description: "Dispute regarding property ownership with neighbor",
    status: "UNDER_REVIEW",
    category: "PROPERTY",
    createdAt: "2024-01-15",
    priority: "MEDIUM"
  },
  {
    id: "2", 
    title: "Consumer Complaint",
    description: "Defective product purchased from online marketplace",
    status: "APPROVED",
    category: "CONSUMER",
    createdAt: "2024-01-10",
    priority: "LOW"
  }
]

const mockLegalQuestions = [
  {
    id: "1",
    question: "What are my rights as a tenant in Delhi?",
    answer: "As a tenant in Delhi, you have rights under the Delhi Rent Control Act...",
    category: "PROPERTY",
    createdAt: "2024-01-12"
  },
  {
    id: "2",
    question: "How to file a consumer complaint?",
    answer: "To file a consumer complaint, you can approach the Consumer Disputes Redressal Commission...",
    category: "CONSUMER",
    createdAt: "2024-01-08"
  }
]

const mockNotifications = [
  {
    id: "1",
    title: "Complaint Status Update",
    message: "Your property dispute complaint is under review",
    type: "INFO",
    priority: "MEDIUM",
    isRead: false,
    createdAt: "2024-01-16"
  },
  {
    id: "2",
    title: "Legal Advice Available",
    message: "Your legal question has been answered by our AI assistant",
    type: "SUCCESS",
    priority: "LOW",
    isRead: true,
    createdAt: "2024-01-12"
  }
]

export default function CitizenDashboard() {
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
    if (session.user.role !== "CITIZEN") {
      router.push("/")
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "SUBMITTED": return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
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
              <Scale className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Citizen Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Public Case Tracker
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Legal SOS
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
                  <p className="text-sm font-medium text-gray-600">Active Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{mockComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Legal Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{mockLegalQuestions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
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
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="legal-qa">Legal Q&A</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
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
                      {mockComplaints.slice(0, 2).map((complaint) => (
                        <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(complaint.status)}>
                                {complaint.status}
                              </Badge>
                              <Badge className={getPriorityColor(complaint.priority)}>
                                {complaint.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{complaint.createdAt}</p>
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
                      <Link href="/citizen/complaints/new">
                        <Button className="w-full" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          File New Complaint
                        </Button>
                      </Link>
                      <Link href="/citizen/legal-qa/new">
                        <Button className="w-full" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Ask Legal Question
                        </Button>
                      </Link>
                      <Link href="/citizen/documents/upload">
                        <Button className="w-full" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </Link>
                      <Link href="/citizen/cases/track">
                        <Button className="w-full" variant="outline">
                          <Search className="h-4 w-4 mr-2" />
                          Track Case
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complaints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Complaints</CardTitle>
                      <Link href="/citizen/complaints/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Complaint
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockComplaints.map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{complaint.title}</h4>
                              <p className="text-gray-600 mt-1">{complaint.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(complaint.status)}>
                                  {complaint.status}
                                </Badge>
                                <Badge className={getPriorityColor(complaint.priority)}>
                                  {complaint.priority}
                                </Badge>
                                <Badge variant="outline">{complaint.category}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{complaint.createdAt}</p>
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

              <TabsContent value="legal-qa" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Legal Questions & Answers</CardTitle>
                      <Link href="/citizen/legal-qa/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Ask Question
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockLegalQuestions.map((qa) => (
                        <div key={qa.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{qa.question}</h4>
                              <p className="text-gray-600 mt-2">{qa.answer}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">{qa.category}</Badge>
                                <span className="text-sm text-gray-500">{qa.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Documents</CardTitle>
                      <Link href="/citizen/documents/upload">
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                      <p className="text-gray-600 mb-4">Upload your legal documents for analysis and safekeeping</p>
                      <Link href="/citizen/documents/upload">
                        <Button>Upload First Document</Button>
                      </Link>
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

            {/* Legal Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Legal Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/legal/constitution" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Indian Constitution</span>
                  </Link>
                  <Link href="/legal/ipc" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Indian Penal Code</span>
                  </Link>
                  <Link href="/legal/crpc" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Code of Criminal Procedure</span>
                  </Link>
                  <Link href="/legal/guides" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Legal Guides</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 bg-red-50 rounded">
                    <Phone className="h-4 w-4 text-red-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">Legal SOS</p>
                      <p className="text-red-600 text-sm">1099</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-blue-50 rounded">
                    <Phone className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">Police</p>
                      <p className="text-blue-600 text-sm">100</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <Phone className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">Women Helpline</p>
                      <p className="text-green-600 text-sm">1091</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
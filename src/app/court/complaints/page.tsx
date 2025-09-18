"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Eye,
  Gavel,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface Complaint {
  id: string
  complaintId: string
  title: string
  description: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IN_COURT' | 'DISMISSED'
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  location?: string
  incidentDate?: string
  createdAt: string
  citizenName: string
  caseNumber?: string
  nextHearing?: string
  assignedJudge?: string
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    complaintId: "COMP-2024-001",
    title: "Property Dispute",
    description: "Dispute regarding property ownership with neighbor",
    status: "IN_COURT",
    category: "PROPERTY",
    priority: "MEDIUM",
    location: "Sector 15, Noida",
    incidentDate: "2024-01-10",
    createdAt: "2024-01-15",
    citizenName: "John Citizen",
    caseNumber: "C-2024-001",
    nextHearing: "2024-01-25",
    assignedJudge: "Honorable Judge Sharma"
  },
  {
    id: "2",
    complaintId: "COMP-2024-002",
    title: "Contract Breach",
    description: "Breach of service contract between two parties",
    status: "UNDER_REVIEW",
    category: "CONTRACT",
    priority: "HIGH",
    location: "Connaught Place, Delhi",
    incidentDate: "2024-01-12",
    createdAt: "2024-01-16",
    citizenName: "Sarah Johnson"
  },
  {
    id: "3",
    complaintId: "COMP-2024-003",
    title: "Employment Dispute",
    description: "Wrongful termination and compensation claim",
    status: "APPROVED",
    category: "LABOR",
    priority: "URGENT",
    location: "Gurgaon, Haryana",
    incidentDate: "2024-01-14",
    createdAt: "2024-01-16",
    citizenName: "Mike Wilson"
  }
]

export default function CourtComplaintsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints)
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(mockComplaints)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "JUDGE" && session.user.role !== "COURT_STAFF") {
      router.push("/")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    let filtered = complaints

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.caseNumber && complaint.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter)
    }

    setFilteredComplaints(filtered)
  }, [complaints, searchTerm, statusFilter, priorityFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED": return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "IN_COURT": return "bg-purple-100 text-purple-800"
      case "DISMISSED": return "bg-gray-100 text-gray-800"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/court">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
                <p className="text-sm text-gray-600">Review and manage court complaints</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="IN_COURT">In Court</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Gavel className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Court</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.status === "IN_COURT").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.status === "UNDER_REVIEW").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.priority === "URGENT").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Complaints List</CardTitle>
                <CardDescription>
                  Showing {filteredComplaints.length} of {complaints.length} complaints
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {complaint.complaintId}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {complaint.category}
                        </div>
                        <div>
                          <span className="font-medium">Citizen:</span> {complaint.citizenName}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {complaint.createdAt}
                        </div>
                        {complaint.caseNumber && (
                          <div>
                            <span className="font-medium">Case No:</span> {complaint.caseNumber}
                          </div>
                        )}
                        {complaint.nextHearing && (
                          <div>
                            <span className="font-medium">Next Hearing:</span> {complaint.nextHearing}
                          </div>
                        )}
                        {complaint.assignedJudge && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Judge:</span> {complaint.assignedJudge}
                          </div>
                        )}
                        {complaint.location && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Location:</span> {complaint.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {complaint.status === "APPROVED" && (
                        <Button variant="outline" size="sm">
                          <Gavel className="h-4 w-4 mr-2" />
                          Schedule Hearing
                        </Button>
                      )}
                      {complaint.status === "IN_COURT" && (
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Case
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {complaint.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
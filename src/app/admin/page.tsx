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
  Settings, 
  Users, 
  FileText, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Eye,
  Plus,
  BarChart3,
  Activity,
  Database,
  Lock,
  Bell,
  UserCheck,
  UserX,
  Clock,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "John Citizen",
    email: "citizen@legalplatform.com",
    role: "CITIZEN",
    isActive: true,
    lastLoginAt: "2024-01-16T10:30:00Z"
  },
  {
    id: "2",
    name: "Police Officer",
    email: "police@legalplatform.com",
    role: "POLICE",
    isActive: true,
    lastLoginAt: "2024-01-16T09:15:00Z"
  },
  {
    id: "3",
    name: "Honorable Judge",
    email: "judge@legalplatform.com",
    role: "JUDGE",
    isActive: true,
    lastLoginAt: "2024-01-15T16:45:00Z"
  }
]

const mockSystemStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalComplaints: 89,
  totalFIRs: 67,
  totalCases: 45,
  systemUptime: "99.9%"
}

const mockRecentActivity = [
  {
    id: "1",
    action: "User Registration",
    entityType: "USER",
    entityName: "New Citizen User",
    timestamp: "2024-01-16T11:30:00Z",
    user: "System"
  },
  {
    id: "2",
    action: "FIR Created",
    entityType: "FIR",
    entityName: "FIR/2024/001",
    timestamp: "2024-01-16T10:15:00Z",
    user: "Police Officer"
  },
  {
    id: "3",
    action: "Complaint Filed",
    entityType: "COMPLAINT",
    entityName: "Property Dispute",
    timestamp: "2024-01-16T09:45:00Z",
    user: "John Citizen"
  }
]

const mockSystemAlerts = [
  {
    id: "1",
    type: "WARNING",
    title: "High Server Load",
    message: "Server CPU usage at 85%",
    timestamp: "2024-01-16T11:00:00Z"
  },
  {
    id: "2",
    type: "INFO",
    title: "Database Backup Completed",
    message: "Daily backup completed successfully",
    timestamp: "2024-01-16T02:00:00Z"
  }
]

export default function AdminDashboard() {
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
    if (session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-purple-100 text-purple-800"
      case "POLICE": return "bg-green-100 text-green-800"
      case "JUDGE": return "bg-blue-100 text-blue-800"
      case "COURT_STAFF": return "bg-orange-100 text-orange-800"
      case "LAWYER": return "bg-red-100 text-red-800"
      case "CITIZEN": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "ERROR": return "bg-red-100 text-red-800 border-red-200"
      case "WARNING": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "INFO": return "bg-blue-100 text-blue-800 border-blue-200"
      case "SUCCESS": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System Administration & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({mockSystemAlerts.length})
              </Button>
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                System Status
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
        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Users</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Active Users</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Complaints</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.totalComplaints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">FIRs</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.totalFIRs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-full">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Cases</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.totalCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Uptime</p>
                  <p className="text-lg font-bold text-gray-900">{mockSystemStats.systemUptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">User Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Citizens</span>
                            <span className="text-sm font-medium">89</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Police</span>
                            <span className="text-sm font-medium">23</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Judges</span>
                            <span className="text-sm font-medium">12</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Lawyers</span>
                            <span className="text-sm font-medium">18</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Court Staff</span>
                            <span className="text-sm font-medium">8</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Admins</span>
                            <span className="text-sm font-medium">6</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Activity Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Today's Logins</span>
                            <span className="text-sm font-medium">47</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New Complaints</span>
                            <span className="text-sm font-medium">5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New FIRs</span>
                            <span className="text-sm font-medium">3</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cases Resolved</span>
                            <span className="text-sm font-medium">2</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">AI Queries</span>
                            <span className="text-sm font-medium">156</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href="/admin/users">
                        <Button className="w-full" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                      </Link>
                      <Link href="/admin/system">
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          System Settings
                        </Button>
                      </Link>
                      <Link href="/admin/analytics">
                        <Button className="w-full" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>User Management</CardTitle>
                      <Link href="/admin/users/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                                {user.isActive ? (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Server Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">CPU Usage</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                              <span className="text-sm font-medium">45%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Memory Usage</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                              </div>
                              <span className="text-sm font-medium">67%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Disk Usage</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                              </div>
                              <span className="text-sm font-medium">34%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Database Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Connections</span>
                            <span className="text-sm font-medium">12/100</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Query Rate</span>
                            <span className="text-sm font-medium">245/sec</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last Backup</span>
                            <span className="text-sm font-medium">2 hours ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSystemAlerts.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              <p className="text-xs mt-1">{alert.message}</p>
                              <p className="text-xs mt-1 opacity-75">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>
                      Monitor compliance with Indian legal regulations and data protection laws
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-900">Data Protection Act</h4>
                            <p className="text-sm text-green-700">All user data is encrypted and stored securely</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-900">Audit Trail</h4>
                            <p className="text-sm text-green-700">Complete audit logs maintained for all actions</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-yellow-900">User Consent</h4>
                            <p className="text-sm text-yellow-700">3 users pending consent renewal</p>
                          </div>
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-900">Access Control</h4>
                            <p className="text-sm text-green-700">Role-based access control properly configured</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                      <p className="text-gray-600 mb-4">Comprehensive analytics and reporting features coming soon</p>
                      <Button>View Basic Reports</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{activity.action}</h4>
                          <p className="text-gray-600 text-xs mt-1">{activity.entityName}</p>
                          <p className="text-gray-500 text-xs mt-1">by {activity.user}</p>
                          <p className="text-gray-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.entityType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Version</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className="font-medium">SQLite</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Framework</span>
                    <span className="font-medium">Next.js 15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Service</span>
                    <span className="font-medium">Z.ai SDK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/users" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <Users className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">User Management</span>
                  </Link>
                  <Link href="/admin/backup" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <Database className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Backup & Restore</span>
                  </Link>
                  <Link href="/admin/logs" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">System Logs</span>
                  </Link>
                  <Link href="/admin/security" className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <Lock className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm">Security Settings</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
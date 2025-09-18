"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Shield, 
  Clock,
  Download,
  Calendar,
  Filter,
  Activity,
  Target,
  Zap
} from "lucide-react"

interface AnalyticsData {
  userGrowth: {
    total: number
    newThisMonth: number
    growthRate: number
    byRole: {
      CITIZEN: number
      POLICE: number
      JUDGE: number
      LAWYER: number
      COURT_STAFF: number
      ADMIN: number
    }
  }
  caseMetrics: {
    total: number
    resolved: number
    pending: number
    avgResolutionTime: number
    byType: {
      CRIMINAL: number
      CIVIL: number
      FAMILY: number
      PROPERTY: number
      CONSUMER: number
    }
  }
  systemPerformance: {
    uptime: number
    responseTime: number
    errorRate: number
    activeUsers: number
    apiCalls: number
  }
  aiUsage: {
    totalQueries: number
    avgResponseTime: number
    successRate: number
    byCategory: {
      LEGAL_QA: number
      FIR_ASSISTANCE: number
      DOCUMENT_ANALYSIS: number
      CASE_PREDICTION: number
    }
  }
}

const mockAnalyticsData: AnalyticsData = {
  userGrowth: {
    total: 1247,
    newThisMonth: 89,
    growthRate: 12.5,
    byRole: {
      CITIZEN: 856,
      POLICE: 156,
      JUDGE: 78,
      LAWYER: 112,
      COURT_STAFF: 34,
      ADMIN: 11
    }
  },
  caseMetrics: {
    total: 456,
    resolved: 312,
    pending: 144,
    avgResolutionTime: 45,
    byType: {
      CRIMINAL: 178,
      CIVIL: 134,
      FAMILY: 67,
      PROPERTY: 45,
      CONSUMER: 32
    }
  },
  systemPerformance: {
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.2,
    activeUsers: 342,
    apiCalls: 15678
  },
  aiUsage: {
    totalQueries: 8934,
    avgResponseTime: 1.2,
    successRate: 98.7,
    byCategory: {
      LEGAL_QA: 4567,
      FIR_ASSISTANCE: 2134,
      DOCUMENT_ANALYSIS: 1234,
      CASE_PREDICTION: 999
    }
  }
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(false)

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">System Performance & Usage Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Time Range:</span>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.userGrowth.total)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatNumber(analyticsData.userGrowth.newThisMonth)} this month ({formatPercentage(analyticsData.userGrowth.growthRate)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cases Resolved</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.caseMetrics.resolved)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((analyticsData.caseMetrics.resolved / analyticsData.caseMetrics.total) * 100)} resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(analyticsData.systemPerformance.uptime)}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.systemPerformance.responseTime}ms avg response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.aiUsage.totalQueries)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(analyticsData.aiUsage.successRate)}% success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="cases">Case Analytics</TabsTrigger>
            <TabsTrigger value="system">System Performance</TabsTrigger>
            <TabsTrigger value="ai">AI Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trend</CardTitle>
                  <CardDescription>User registration and activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Growth Chart</h3>
                    <p className="text-gray-600 mb-4">
                      User growth visualization would be displayed here
                    </p>
                    <Button variant="outline">View Detailed Chart</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution by Role</CardTitle>
                  <CardDescription>Breakdown of users by their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.userGrowth.byRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium">{role.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{formatNumber(count)}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / analyticsData.userGrowth.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Case Resolution Metrics</CardTitle>
                  <CardDescription>Case handling and resolution statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Cases</span>
                      <span className="text-lg font-bold">{formatNumber(analyticsData.caseMetrics.total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Resolved</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formatNumber(analyticsData.caseMetrics.resolved)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {formatNumber(analyticsData.caseMetrics.pending)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Resolution Time</span>
                      <span className="text-lg font-bold">{analyticsData.caseMetrics.avgResolutionTime} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cases by Type</CardTitle>
                  <CardDescription>Distribution of cases by legal category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.caseMetrics.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{formatNumber(count)}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(count / analyticsData.caseMetrics.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formatPercentage(analyticsData.systemPerformance.uptime)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-lg font-bold">{analyticsData.systemPerformance.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <Badge className={analyticsData.systemPerformance.errorRate < 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {formatPercentage(analyticsData.systemPerformance.errorRate)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-lg font-bold">{formatNumber(analyticsData.systemPerformance.activeUsers)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-lg font-bold">{formatNumber(analyticsData.systemPerformance.apiCalls)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm font-medium">API Server</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm font-medium">AI Services</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                        <span className="text-sm font-medium">Storage</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Usage Statistics</CardTitle>
                  <CardDescription>AI-powered feature usage metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Queries</span>
                      <span className="text-lg font-bold">{formatNumber(analyticsData.aiUsage.totalQueries)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="text-lg font-bold">{analyticsData.aiUsage.avgResponseTime}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formatPercentage(analyticsData.aiUsage.successRate)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Usage by Category</CardTitle>
                  <CardDescription>Breakdown of AI usage by feature category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.aiUsage.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium">{category.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{formatNumber(count)}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(count / analyticsData.aiUsage.totalQueries) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
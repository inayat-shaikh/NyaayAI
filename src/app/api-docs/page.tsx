"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Code, 
  Server, 
  Shield, 
  Database,
  Key,
  FileText,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"

interface ApiEndpoint {
  method: string
  path: string
  description: string
  authentication: boolean
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  responseExample?: any
  notes?: string
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new user",
    authentication: false,
    parameters: [
      {
        name: "email",
        type: "string",
        required: true,
        description: "User email address"
      },
      {
        name: "password",
        type: "string",
        required: true,
        description: "User password (min 8 characters)"
      },
      {
        name: "name",
        type: "string",
        required: true,
        description: "User full name"
      },
      {
        name: "role",
        type: "string",
        required: true,
        description: "User role (CITIZEN, POLICE, JUDGE, LAWYER, COURT_STAFF)"
      }
    ],
    responseExample: {
      message: "User registered successfully",
      user: {
        id: "user_id",
        email: "user@example.com",
        name: "User Name",
        role: "CITIZEN"
      }
    }
  },
  {
    method: "POST",
    path: "/api/complaints",
    description: "File a new complaint",
    authentication: true,
    parameters: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Complaint title"
      },
      {
        name: "description",
        type: "string",
        required: true,
        description: "Detailed description of the complaint"
      },
      {
        name: "category",
        type: "string",
        required: true,
        description: "Complaint category"
      },
      {
        name: "priority",
        type: "string",
        required: true,
        description: "Priority level (LOW, MEDIUM, HIGH, URGENT)"
      },
      {
        name: "location",
        type: "string",
        required: false,
        description: "Location related to complaint"
      }
    ],
    responseExample: {
      message: "Complaint filed successfully",
      complaint: {
        id: "complaint_id",
        title: "Complaint Title",
        status: "SUBMITTED",
        createdAt: "2024-01-16T10:30:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/api/firs",
    description: "Create a new FIR",
    authentication: true,
    parameters: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "FIR title"
      },
      {
        name: "description",
        type: "string",
        required: true,
        description: "Detailed description of the incident"
      },
      {
        name: "complaintId",
        type: "string",
        required: false,
        description: "Associated complaint ID"
      },
      {
        name: "category",
        type: "string",
        required: true,
        description: "FIR category"
      },
      {
        name: "priority",
        type: "string",
        required: true,
        description: "Priority level"
      }
    ],
    responseExample: {
      message: "FIR created successfully",
      fir: {
        id: "fir_id",
        firNumber: "FIR/2024/001",
        status: "DRAFT",
        createdAt: "2024-01-16T10:30:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/api/legal-qa",
    description: "Get legal Q&A response",
    authentication: true,
    parameters: [
      {
        name: "question",
        type: "string",
        required: true,
        description: "Legal question"
      },
      {
        name: "category",
        type: "string",
        required: false,
        description: "Legal category"
      }
    ],
    responseExample: {
      answer: "Detailed legal answer based on Indian laws...",
      sources: ["Indian Constitution", "IPC", "CrPC"],
      confidence: 0.95
    }
  },
  {
    method: "POST",
    path: "/api/documents/upload",
    description: "Upload legal documents",
    authentication: true,
    parameters: [
      {
        name: "file",
        type: "File",
        required: true,
        description: "Document file (PDF, JPEG, PNG, DOC, DOCX)"
      },
      {
        name: "documentType",
        type: "string",
        required: false,
        description: "Type of document"
      }
    ],
    responseExample: {
      message: "File uploaded successfully",
      document: {
        id: "document_id",
        fileName: "document.pdf",
        status: "UPLOADED"
      }
    }
  },
  {
    method: "POST",
    path: "/api/sos",
    description: "Emergency Legal SOS request",
    authentication: true,
    parameters: [
      {
        name: "type",
        type: "string",
        required: true,
        description: "Type of emergency"
      },
      {
        name: "description",
        type: "string",
        required: true,
        description: "Emergency description"
      },
      {
        name: "location",
        type: "string",
        required: true,
        description: "Current location"
      },
      {
        name: "urgency",
        type: "string",
        required: false,
        description: "Urgency level"
      }
    ],
    responseExample: {
      message: "SOS request processed successfully",
      advice: "Immediate legal advice...",
      emergencyContacts: {
        police: "100",
        ambulance: "108",
        legalAid: "1516"
      }
    }
  }
]

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(text)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-100 text-blue-800"
      case "POST": return "bg-green-100 text-green-800"
      case "PUT": return "bg-yellow-100 text-yellow-800"
      case "DELETE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
                <p className="text-sm text-gray-600">Indian Legal Platform API Reference</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Welcome to the Indian Legal Platform API documentation. This API provides access to all platform features including user management, complaint filing, FIR creation, legal Q&A, document management, and emergency services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://api.legalplatform.com</code></span>
              </div>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Authentication: Bearer Token</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Format: JSON</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {endpoint.path}
                        </code>
                        {endpoint.authentication && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Auth Required
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`)}
                      >
                        {copiedEndpoint === `${endpoint.method} ${endpoint.path}` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Parameters</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="flex items-start space-x-2">
                                <div className="flex-shrink-0">
                                  <Badge variant="outline" className="text-xs">
                                    {param.type}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{param.name}</span>
                                    {param.required && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{param.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {endpoint.responseExample && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Response Example</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm">
                            <code>{JSON.stringify(endpoint.responseExample, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {endpoint.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800">{endpoint.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>How to authenticate with the API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Getting Access Token</h4>
                  <p className="text-gray-700 mb-4">
                    To access protected endpoints, you need to obtain a JWT token by signing in:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Using the Token</h4>
                  <p className="text-gray-700 mb-4">
                    Include the token in the Authorization header:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`Authorization: Bearer your_jwt_token`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Token Expiration</h4>
                  <p className="text-gray-700">
                    JWT tokens expire after 24 hours. You should implement token refresh logic in your application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
                <CardDescription>Understanding API error responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Error Response Format</h4>
                  <p className="text-gray-700 mb-4">
                    All API errors follow a consistent format:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error information (if available)"
}`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Common Error Codes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">400</Badge>
                      <div>
                        <p className="font-medium">Bad Request</p>
                        <p className="text-sm text-gray-600">Invalid request parameters or malformed JSON</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">401</Badge>
                      <div>
                        <p className="font-medium">Unauthorized</p>
                        <p className="text-sm text-gray-600">Missing or invalid authentication token</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">403</Badge>
                      <div>
                        <p className="font-medium">Forbidden</p>
                        <p className="text-sm text-gray-600">Insufficient permissions for the requested resource</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">404</Badge>
                      <div>
                        <p className="font-medium">Not Found</p>
                        <p className="text-sm text-gray-600">Requested resource does not exist</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">500</Badge>
                      <div>
                        <p className="font-medium">Internal Server Error</p>
                        <p className="text-sm text-gray-600">Server-side error occurred</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rate Limiting</h4>
                  <p className="text-gray-700">
                    API endpoints are rate limited to prevent abuse. If you exceed the rate limit, you'll receive a 429 status code.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>Practical examples of using the API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">JavaScript/Node.js Example</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`// Authentication
const login = async () => {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password'
    })
  });
  
  const data = await response.json();
  return data.token;
};

// Filing a complaint
const fileComplaint = async (token) => {
  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      title: 'Property Dispute',
      description: 'Dispute regarding property boundaries',
      category: 'PROPERTY',
      priority: 'MEDIUM',
      location: 'Delhi, India'
    })
  });
  
  return await response.json();
};`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Python Example</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`import requests
import json

# Authentication
def login():
    response = requests.post('https://api.legalplatform.com/api/auth/signin',
        json={
            'email': 'user@example.com',
            'password': 'password'
        })
    return response.json()['token']

# Filing a complaint
def file_complaint(token):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    data = {
        'title': 'Property Dispute',
        'description': 'Dispute regarding property boundaries',
        'category': 'PROPERTY',
        'priority': 'MEDIUM',
        'location': 'Delhi, India'
    }
    
    response = requests.post(
        'https://api.legalplatform.com/api/complaints',
        headers=headers,
        json=data
    )
    
    return response.json()`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">cURL Example</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{`# Authentication
curl -X POST https://api.legalplatform.com/api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password"}'

# Filing a complaint
curl -X POST https://api.legalplatform.com/api/complaints \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "title": "Property Dispute",
    "description": "Dispute regarding property boundaries",
    "category": "PROPERTY",
    "priority": "MEDIUM",
    "location": "Delhi, India"
  }'`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
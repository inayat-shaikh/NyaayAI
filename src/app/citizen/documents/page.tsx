"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentUpload from "@/components/document-upload/DocumentUpload"
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface Document {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  extractedText?: string
  error?: string
  createdAt: string
  documentType: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    fileName: 'property_deed.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    status: 'COMPLETED',
    extractedText: 'This is a property deed document...',
    createdAt: '2024-01-15',
    documentType: 'PROPERTY'
  },
  {
    id: '2',
    fileName: 'id_proof.jpg',
    fileSize: 512000,
    mimeType: 'image/jpeg',
    status: 'PROCESSING',
    createdAt: '2024-01-16',
    documentType: 'IDENTIFICATION'
  }
]

export default function CitizenDocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [activeTab, setActiveTab] = useState("upload")

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPLOADED': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'PROCESSING': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                <p className="text-sm text-gray-600">Upload and manage your legal documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Documents
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <DocumentUpload 
              onUploadComplete={(doc) => {
                setDocuments(prev => [doc, ...prev])
              }}
            />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>
                      View and manage all your uploaded documents
                    </CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab("upload")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Upload your legal documents for analysis and safekeeping</p>
                    <Button onClick={() => setActiveTab("upload")}>
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <h4 className="font-medium">{doc.fileName}</h4>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(doc.fileSize)} • {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(doc.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(doc.status)}
                                <span>{doc.status}</span>
                              </div>
                            </Badge>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {doc.extractedText && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                              <strong>Extracted Text:</strong> {doc.extractedText.substring(0, 100)}...
                            </p>
                          </div>
                        )}
                        
                        {doc.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">
                              <strong>Error:</strong> {doc.error}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
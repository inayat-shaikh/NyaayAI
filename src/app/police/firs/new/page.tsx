"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  FileText,
  Brain,
  Plus,
  X,
  Search,
  Save,
  Send
} from "lucide-react"
import Link from "next/link"

const priorityLevels = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" }
]

const policeStations = [
  "Sector 20 Police Station, Noida",
  "Connaught Place Police Station, Delhi",
  "Saket Police Station, Delhi",
  "Gurgaon Police Station",
  "Faridabad Police Station"
]

export default function NewFIRPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    incidentLocation: "",
    policeStation: "",
    district: "",
    state: "",
    incidentDate: "",
    incidentTime: ""
  })
  const [files, setFiles] = useState<File[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [finalSections, setFinalSections] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateAIRecommendations = async () => {
    if (!formData.description.trim()) {
      setError("Please provide a description first")
      return
    }

    setIsGeneratingAI(true)
    setError("")

    try {
      const response = await fetch("/api/fir/ai-recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description: formData.description,
          title: formData.title,
          incidentLocation: formData.incidentLocation
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAiRecommendations(data.recommendations)
      } else {
        setError(data.error || "Failed to generate AI recommendations")
      }
    } catch (error) {
      setError("An error occurred while generating AI recommendations")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const toggleSection = (section: string) => {
    setFinalSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("priority", formData.priority)
      submitData.append("incidentLocation", formData.incidentLocation)
      submitData.append("policeStation", formData.policeStation)
      submitData.append("district", formData.district)
      submitData.append("state", formData.state)
      submitData.append("incidentDate", formData.incidentDate)
      submitData.append("incidentTime", formData.incidentTime)
      submitData.append("aiRecommendations", JSON.stringify(aiRecommendations))
      submitData.append("finalSections", JSON.stringify(finalSections))

      files.forEach((file, index) => {
        submitData.append(`files[${index}]`, file)
      })

      const response = await fetch("/api/firs", {
        method: "POST",
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("FIR created successfully!")
        setTimeout(() => {
          router.push("/police")
        }, 2000)
      } else {
        setError(data.error || "Failed to create FIR")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/police">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New FIR</h1>
              <p className="text-sm text-gray-600">File a First Information Report with AI assistance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>FIR Details</CardTitle>
                <CardDescription>
                  Provide accurate information about the incident. AI will help recommend relevant legal sections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">FIR Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      placeholder="Brief title of the incident"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      placeholder="Provide detailed description of the incident including what happened, when, where, and who was involved"
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">AI Legal Assistance</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIRecommendations}
                      disabled={isGeneratingAI || !formData.description.trim()}
                    >
                      {isGeneratingAI ? (
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Get AI Recommendations
                    </Button>
                  </div>

                  {/* AI Recommendations */}
                  {aiRecommendations && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center mb-3">
                        <Brain className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">AI Legal Recommendations</h4>
                        <Badge className="ml-auto bg-blue-100 text-blue-800">
                          Confidence: {Math.round(aiRecommendations.confidence * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Recommended IPC Sections:</h5>
                          <div className="space-y-2">
                            {aiRecommendations.sections?.map((section: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={finalSections.includes(section.section)}
                                    onChange={() => toggleSection(section.section)}
                                    className="rounded border-gray-300"
                                  />
                                  <div>
                                    <span className="font-medium text-sm">{section.section}</span>
                                    <p className="text-xs text-gray-600">{section.description}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {section.punishment}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {aiRecommendations.bailableStatus && (
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm font-medium text-yellow-800">Bailable Status:</p>
                            <p className="text-sm text-yellow-700">{aiRecommendations.bailableStatus}</p>
                          </div>
                        )}
                        
                        {aiRecommendations.cognizableStatus && (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm font-medium text-green-800">Cognizable Status:</p>
                            <p className="text-sm text-green-700">{aiRecommendations.cognizableStatus}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center space-x-2">
                                <Badge className={priority.color}>{priority.label}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="policeStation">Police Station *</Label>
                      <Select value={formData.policeStation} onValueChange={(value) => handleInputChange("policeStation", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select police station" />
                        </SelectTrigger>
                        <SelectContent>
                          {policeStations.map((station) => (
                            <SelectItem key={station} value={station}>
                              {station}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incidentLocation">Incident Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="incidentLocation"
                          value={formData.incidentLocation}
                          onChange={(e) => handleInputChange("incidentLocation", e.target.value)}
                          required
                          placeholder="Where did the incident occur?"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        required
                        placeholder="District"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incidentDate">Incident Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="incidentDate"
                          type="date"
                          value={formData.incidentDate}
                          onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentTime">Incident Time</Label>
                      <Input
                        id="incidentTime"
                        type="time"
                        value={formData.incidentTime}
                        onChange={(e) => handleInputChange("incidentTime", e.target.value)}
                        placeholder="Time of incident"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Supporting Evidence</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Upload evidence documents, photos, videos, or other supporting materials
                      </p>
                      <div className="flex justify-center space-x-4">
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4,.avi"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <FileText className="h-4 w-4 mr-2" />
                              Choose Files
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(file.size / 1024).toFixed(1)} KB
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Link href="/police">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit FIR
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FIR Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  FIR Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-900">Cognizable Offenses</h4>
                    <p className="text-red-700 mt-1">Police can arrest without warrant for serious crimes</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Non-Cognizable Offenses</h4>
                    <p className="text-yellow-700 mt-1">Warrant required for arrest, court permission needed</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Bailable vs Non-Bailable</h4>
                    <p className="text-blue-700 mt-1">Affects whether bail can be granted as a matter of right</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search Existing FIRs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Legal Research
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legal Sections Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Common IPC Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Section 302:</span> Murder
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Section 376:</span> Rape
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Section 420:</span> Cheating
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Section 324:</span> Hurt
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Section 379:</span> Theft
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
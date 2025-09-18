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
  MessageSquare, 
  Mic, 
  Send,
  Brain,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText
} from "lucide-react"
import Link from "next/link"
import { LegalCategory } from "@prisma/client"

const legalCategories = [
  { value: LegalCategory.CONSTITUTIONAL, label: "Constitutional Law" },
  { value: LegalCategory.CRIMINAL, label: "Criminal Law" },
  { value: LegalCategory.CIVIL, label: "Civil Law" },
  { value: LegalCategory.FAMILY, label: "Family Law" },
  { value: LegalCategory.PROPERTY, label: "Property Law" },
  { value: LegalCategory.LABOR, label: "Labor Law" },
  { value: LegalCategory.TAXATION, label: "Taxation Law" },
  { value: LegalCategory.CORPORATE, label: "Corporate Law" },
  { value: LegalCategory.INTELLECTUAL_PROPERTY, label: "Intellectual Property" },
  { value: LegalCategory.ENVIRONMENTAL, label: "Environmental Law" },
  { value: LegalCategory.CONSUMER, label: "Consumer Law" },
  { value: LegalCategory.OTHER, label: "Other" }
]

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "mr", label: "मराठी (Marathi)" },
  { value: "gu", label: "ગુજરાતી (Gujarati)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { value: "ml", label: "മലയാളം (Malayalam)" },
  { value: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" }
]

export default function NewLegalQuestionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    language: "en",
    isVoice: false
  })
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateAIResponse = async () => {
    if (!formData.question.trim()) {
      setError("Please enter your question first")
      return
    }

    setIsGeneratingAI(true)
    setError("")

    try {
      const response = await fetch("/api/legal-qa/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: formData.question,
          category: formData.category,
          language: formData.language
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAiResponse(data.response)
      } else {
        setError(data.error || "Failed to generate AI response")
      }
    } catch (error) {
      setError("An error occurred while generating AI response")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/legal-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          aiResponse: aiResponse
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Your legal question has been submitted successfully!")
        setTimeout(() => {
          router.push("/citizen")
        }, 2000)
      } else {
        setError(data.error || "Failed to submit question")
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
            <Link href="/citizen">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Ask Legal Question</h1>
              <p className="text-sm text-gray-600">Get AI-powered legal advice based on Indian laws</p>
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
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Your Legal Question
                </CardTitle>
                <CardDescription>
                  Ask any legal question and get AI-powered answers based on Indian Constitution, IPC, CrPC, and other laws
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
                    <Label htmlFor="question">Your Question *</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => handleInputChange("question", e.target.value)}
                      required
                      placeholder="Describe your legal question in detail. Include relevant context, dates, and specific circumstances."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Legal Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select legal category" />
                        </SelectTrigger>
                        <SelectContent>
                          {legalCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* AI Response Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">AI Legal Assistant</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIResponse}
                        disabled={isGeneratingAI || !formData.question.trim()}
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        Generate AI Response
                      </Button>
                    </div>

                    {aiResponse && (
                      <div className="border rounded-lg p-4 bg-blue-50 max-h-96 overflow-y-auto">
                        <div className="flex items-center mb-3">
                          <Brain className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-900">AI Legal Analysis</h4>
                          <Badge className="ml-auto bg-blue-100 text-blue-800">
                            Confidence: {Math.round(aiResponse.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Answer:</h5>
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {aiResponse.answer}
                            </div>
                          </div>
                          
                          {aiResponse.relevantSections && aiResponse.relevantSections.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Relevant Legal Sections:</h5>
                              <div className="space-y-2">
                                {aiResponse.relevantSections.map((section: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                    <div className="flex-1">
                                      <span className="font-medium text-sm block">{section.section}</span>
                                      <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {section.act}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {aiResponse.nextSteps && aiResponse.nextSteps.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Recommended Next Steps:</h5>
                              <ul className="space-y-2">
                                {aiResponse.nextSteps.map((step: string, index: number) => (
                                  <li key={index} className="flex items-start text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Follow-up Questions */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Follow-up Questions:</h5>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    question: "Can you explain this in more detail with specific examples?"
                                  }))
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Explain in more detail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    question: "What are the potential risks and challenges in this situation?"
                                  }))
                                }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Discuss risks and challenges
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    question: "What documents or evidence should I prepare for this case?"
                                  }))
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Required documentation
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    question: "What is the expected timeline and process for resolving this issue?"
                                  }))
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Timeline and process
                              </Button>
                            </div>
                          </div>
                          
                          {aiResponse.disclaimer && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-800 italic">
                                {aiResponse.disclaimer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link href="/citizen">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Question"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Tips for Better Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Be Specific</h4>
                    <p className="text-blue-700 mt-1">Include specific details like dates, locations, and relevant circumstances</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Provide Context</h4>
                    <p className="text-green-700 mt-1">Explain the background and what led to your legal question</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Select Category</h4>
                    <p className="text-yellow-700 mt-1">Choose the most relevant legal category for better accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Input Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Input Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input (Coming Soon)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Interface (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legal Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Legal Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    The AI-generated responses are for informational purposes only and should not be considered as legal advice.
                  </p>
                  <p>
                    For complex legal matters, please consult with a qualified lawyer.
                  </p>
                  <p>
                    The platform does not create an attorney-client relationship.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Property Rights",
                    "Consumer Protection",
                    "Labor Laws",
                    "Family Law",
                    "Criminal Procedure",
                    "Contract Law"
                  ].map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => handleInputChange("question", `What are my rights regarding ${topic.toLowerCase()}?`)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle/ThemeToggle"
import { 
  Users, 
  Shield, 
  Gavel, 
  Briefcase, 
  Building, 
  Settings, 
  BookOpen, 
  FileText, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Menu,
  X
} from "lucide-react"

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-blue-600" />,
    title: "Legal Q&A",
    description: "Get instant legal advice based on Indian Constitution, IPC, CrPC, and other laws"
  },
  {
    icon: <FileText className="h-8 w-8 text-green-600" />,
    title: "Complaint Filing",
    description: "File complaints with text, voice, and document upload support"
  },
  {
    icon: <Shield className="h-8 w-8 text-red-600" />,
    title: "FIR Management",
    description: "AI-powered FIR creation with IPC/CrPC section recommendations"
  },
  {
    icon: <Gavel className="h-8 w-8 text-purple-600" />,
    title: "Case Tracking",
    description: "Real-time case tracking from complaint to judgment"
  },
  {
    icon: <AlertTriangle className="h-8 w-8 text-orange-600" />,
    title: "Legal SOS",
    description: "Emergency legal assistance at your fingertips"
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
    title: "Multilingual Support",
    description: "Support for major Indian languages with text and voice"
  }
]

const userRoles = [
  {
    title: "Citizen",
    icon: <Users className="h-12 w-12 text-blue-600" />,
    description: "File complaints, get legal advice, track cases",
    features: ["Legal Q&A", "Complaint Filing", "Case Tracking", "Document Upload", "Legal SOS"],
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
    link: "/auth/signin"
  },
  {
    title: "Police",
    icon: <Shield className="h-12 w-12 text-green-600" />,
    description: "Create FIRs, manage investigations, assign cases",
    features: ["FIR Creation", "AI Assistance", "Case Management", "Evidence Upload", "Jurisdiction Assignment"],
    color: "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800",
    link: "/auth/signin"
  },
  {
    title: "Judge",
    icon: <Gavel className="h-12 w-12 text-purple-600" />,
    description: "Manage cases, schedule hearings, deliver judgments",
    features: ["Case Dashboard", "Hearing Management", "Judgment Writing", "Case Analysis", "Workflow Automation"],
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
    link: "/auth/signin"
  },
  {
    title: "Lawyer",
    icon: <Briefcase className="h-12 w-12 text-orange-600" />,
    description: "Represent clients, provide legal advice, manage cases",
    features: ["Client Management", "Case Viewing", "Legal Advice", "Document Drafting", "Communication"],
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800",
    link: "/auth/signin"
  },
  {
    title: "Court Staff",
    icon: <Building className="h-12 w-12 text-indigo-600" />,
    description: "Support court operations, manage dockets, schedule hearings",
    features: ["Docket Management", "Hearing Scheduling", "Case Processing", "Document Management", "Notifications"],
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800",
    link: "/auth/signin"
  },
  {
    title: "Administrator",
    icon: <Settings className="h-12 w-12 text-red-600" />,
    description: "Manage users, monitor system, ensure compliance",
    features: ["User Management", "System Monitoring", "Compliance", "Analytics", "Audit Trails"],
    color: "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800",
    link: "/auth/signin"
  }
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    // Redirect based on user role
    const redirectMap = {
      ADMIN: "/admin",
      POLICE: "/police",
      JUDGE: "/court",
      COURT_STAFF: "/court",
      LAWYER: "/lawyer",
      CITIZEN: "/citizen"
    }
    
    const redirectPath = redirectMap[session.user.role as keyof typeof redirectMap] || "/dashboard"
    router.push(redirectPath)
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Gavel className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Indian Legal Platform</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">AI-Powered Judicial Workflow System</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t dark:border-gray-700">
              <div className="flex flex-col space-y-2">
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Transforming Indian Legal System
          </h2>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            An integrated platform for citizens, police, lawyers, and courts. 
            AI-powered legal advice, FIR filing, case management, and judicial workflow automation.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Platform Features</h3>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Comprehensive features designed for the Indian legal ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Choose Your Role</h3>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Select your role to access specialized features and workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {userRoles.map((role, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 ${role.color} border-2 hover:shadow-lg`}
                onClick={() => router.push(role.link)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {role.icon}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.features.map((feature, featIndex) => (
                        <Badge key={featIndex} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Access {role.title} Portal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 text-sm sm:text-base">Legal Support</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">AI</div>
              <div className="text-blue-100 text-sm sm:text-base">Powered Assistance</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">22+</div>
              <div className="text-blue-100 text-sm sm:text-base">Indian Languages</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">Secure</div>
              <div className="text-blue-100 text-sm sm:text-base">Compliant Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold">Legal Platform</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming Indian legal system with AI-powered technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/auth/signin" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">Indian Constitution</Link></li>
                <li><Link href="#" className="hover:text-white">IPC</Link></li>
                <li><Link href="#" className="hover:text-white">CrPC</Link></li>
                <li><Link href="#" className="hover:text-white">Legal Aid</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Emergency Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Legal SOS: 1099</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Support Available 24/7</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Indian Legal Platform. All rights reserved. | Compliant with Indian IT Rules</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
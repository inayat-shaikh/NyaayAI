"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAuthContext } from "@/contexts/AuthContext"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log('=== CUSTOM SIGNIN DEBUG: Attempting to sign in ===')
      console.log('Email:', email)
      
      const result = await login(email, password)

      console.log('CUSTOM SIGNIN DEBUG: Login result:', result)

      if (result.success) {
        console.log('CUSTOM SIGNIN DEBUG: Login successful, redirecting...')
        
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect based on user role (we'll get this from the hook)
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        console.log('CUSTOM SIGNIN DEBUG: Session data:', sessionData)
        
        if (sessionData.user?.role) {
          switch (sessionData.user.role) {
            case "ADMIN":
              console.log('CUSTOM SIGNIN DEBUG: Redirecting to admin dashboard')
              router.push("/admin")
              break
            case "POLICE":
              console.log('CUSTOM SIGNIN DEBUG: Redirecting to police dashboard')
              router.push("/police")
              break
            case "JUDGE":
            case "COURT_STAFF":
              console.log('CUSTOM SIGNIN DEBUG: Redirecting to court dashboard')
              router.push("/court")
              break
            case "LAWYER":
              console.log('CUSTOM SIGNIN DEBUG: Redirecting to lawyer dashboard')
              router.push("/lawyer")
              break
            case "CITIZEN":
              console.log('CUSTOM SIGNIN DEBUG: Redirecting to citizen dashboard')
              router.push("/citizen")
              break
            default:
              console.log('CUSTOM SIGNIN DEBUG: Unknown role, redirecting to dashboard')
              router.push("/dashboard")
          }
        } else {
          console.log('CUSTOM SIGNIN DEBUG: No role in session, redirecting to dashboard')
          router.push("/dashboard")
        }
      } else {
        console.log('CUSTOM SIGNIN DEBUG: Login failed:', result.error)
        setError(result.error || "Invalid email or password")
      }
    } catch (error) {
      console.error('CUSTOM SIGNIN DEBUG: Sign in catch error:', error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Indian Legal Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account?</span>
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 ml-1"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-xs text-gray-500">
          <p>Default Admin Credentials:</p>
          <p>Email: admin@legalplatform.com | Password: Admin@123</p>
        </div>
      </div>
    </div>
  )
}
import { NextRequest, NextResponse } from "next/server"
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  try {
    const { description, title, incidentLocation } = await req.json()

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create prompt for FIR legal recommendations
    const systemPrompt = `You are an AI legal assistant specializing in Indian criminal law. Based on the FIR description provided, recommend relevant IPC sections and provide legal guidance.

Your task is to:
1. Analyze the incident description
2. Identify the most relevant IPC sections
3. Provide brief descriptions of each section
4. Indicate punishment if applicable
5. Determine if the offense is bailable/cognizable
6. Provide confidence level in your analysis

Format your response as JSON with the following structure:
{
  "sections": [
    {
      "section": "Section number (e.g., 302)",
      "description": "Brief description of what the section covers",
      "punishment": "Punishment prescribed",
      "bailable": true/false,
      "cognizable": true/false
    }
  ],
  "bailableStatus": "Summary of bailable status",
  "cognizableStatus": "Summary of cognizable status",
  "confidence": 0.85,
  "additionalNotes": "Any additional legal guidance or next steps"
}

Important IPC Sections to consider:
- Section 302: Punishment for murder
- Section 304: Punishment for culpable homicide not amounting to murder
- Section 324: Voluntarily causing hurt by dangerous weapons or means
- Section 326: Voluntarily causing grievous hurt by dangerous weapons or means
- Section 376: Punishment for rape
- Section 379: Punishment for theft
- Section 380: Theft in dwelling house, etc.
- Section 383: Extortion
- Section 420: Cheating and dishonestly inducing delivery of property
- Section 465: Punishment for forgery
- Section 467: Forgery of valuable security, will, etc.
- Section 468: Forgery for purpose of cheating
- Section 506: Punishment for criminal intimidation

Guidelines:
- Be conservative in recommendations
- Provide multiple relevant sections when applicable
- Include both primary and secondary offenses
- Consider the severity and nature of the offense
- Provide practical guidance for investigation`

    const userPrompt = `FIR Details:
Title: ${title || 'Not specified'}
Location: ${incidentLocation || 'Not specified'}
Description: ${description}

Please analyze this FIR and recommend the most appropriate IPC sections with detailed explanations.`

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })

      let recommendations
      try {
        // Try to parse as JSON first
        recommendations = JSON.parse(completion.choices[0]?.message?.content || '{}')
      } catch (parseError) {
        // If parsing fails, create a structured response from the text
        const textResponse = completion.choices[0]?.message?.content || ''
        recommendations = {
          sections: [],
          bailableStatus: "Unable to determine",
          cognizableStatus: "Unable to determine",
          confidence: 0.5,
          additionalNotes: textResponse
        }
      }

      return NextResponse.json({
        recommendations: {
          ...recommendations,
          confidence: recommendations.confidence || 0.7,
          sections: recommendations.sections || []
        }
      })

    } catch (aiError) {
      console.error('AI generation error:', aiError)
      
      // Fallback response when AI is unavailable
      return NextResponse.json({
        recommendations: {
          sections: [
            {
              section: "To be determined",
              description: "AI service temporarily unavailable. Please consult legal manual or senior officer.",
              punishment: "To be determined",
              bailable: false,
              cognizable: false
            }
          ],
          bailableStatus: "Unable to determine - Please consult legal resources",
          cognizableStatus: "Unable to determine - Please consult legal resources",
          confidence: 0.2,
          additionalNotes: "AI service is currently unavailable. Please consult with senior police officers or legal department for section recommendations."
        }
      })
    }

  } catch (error) {
    console.error("FIR AI recommendation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
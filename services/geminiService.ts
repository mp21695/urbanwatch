import { GoogleGenAI } from "@google/genai";
import { Complaint } from "../types";
import { ISSUE_LABELS } from "../constants";

/**
 * World-class API Initialization
 * Following @google/genai Coding Guidelines:
 * - Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
 * - The API key must be obtained exclusively from the environment variable process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTransparencyReport(area: string, issueType: string, complaints: Complaint[]) {
  const prompt = `
    Context: UrbanWatch is a civic accountability system.
    Task: Write a high-quality, professional, and fact-based public transparency report.
    Details: 
    - Area: ${area}
    - Issue Category: ${ISSUE_LABELS[issueType as keyof typeof ISSUE_LABELS] || issueType}
    - Total Breached Complaints: ${complaints.length}
    - Delay Status: These complaints have exceeded their mandated Service Level Agreement (SLA).
    
    Guidelines:
    - Title should be catchy but serious.
    - Focus on facts and public accountability.
    - Mention that this is an automated report triggered by SLA breaches.
    - Do not name individual citizens.
    - Keep it under 200 words.
  `;

  try {
    // Following @google/genai Coding Guidelines:
    // - Use model: 'gemini-3-flash-preview' for basic text tasks (summarization/reporting)
    // - Always access response.text directly (it is a property, not a method)
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI report. Please check back later.";
  }
}
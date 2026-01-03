import { GoogleGenAI } from "@google/genai";
import { Complaint } from "../types";
import { ISSUE_LABELS } from "../constants";

/**
 * World-class API Initialization
 * Following @google/genai Coding Guidelines:
 * - Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
 * - The API key must be obtained exclusively from the environment variable process.env.API_KEY.
 */
const apiKey = process.env.GEMINI_API_KEY;
console.log("Gemini API key present:", !!apiKey); // do NOT log the key itself
if (!apiKey) {
  console.warn("No Gemini API key found - set VITE_GEMINI_API_KEY in .env.local and restart the dev server.");
}

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function generateTransparencyReport(area: string, issueType: string, complaints: Complaint[]) {
  // Check if API key is available
  if (!ai) {
    console.error("Gemini API key not configured");
    return `⚠️ Error: Gemini API key not configured.\n\nTo enable AI-generated reports, add VITE_GEMINI_API_KEY to your .env.local file and restart the dev server.\n\nArea: ${area}\nIssue Type: ${ISSUE_LABELS[issueType as keyof typeof ISSUE_LABELS] || issueType}\nBreached Cases: ${complaints.length}`;
  }

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
    // - Use model: 'gemini-1.5-flash' for basic text tasks (summarization/reporting)
    // - Always access response.text directly (it is a property, not a method)
    console.log("📤 Sending request to Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    console.log("📥 Gemini API Response:", response);
    console.log("Response keys:", Object.keys(response || {}));
    console.log("Response.text type:", typeof response?.text);
    console.log("Response.text value:", response?.text);

    // Log a short preview (safe) for debugging
    if (response?.text) {
      console.log("✅ Gemini generated text (preview):", response.text.slice(0, 200).replace(/\n/g, ' '));
      return response.text;
    } else {
      console.warn("⚠️ Gemini returned no text:", response);
      return "No response from Gemini API";
    }
  } catch (error) {
    console.error("❌ Gemini API Error Details:", error);
    console.error("Error message:", (error as any)?.message);
    console.error("Error status:", (error as any)?.status);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    if ((error as any)?.response) {
      console.error("Gemini response error:", (error as any).response);
    }
    return "Error generating AI report. Please check back later.";
  }
}

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../constants";

export const generateQubitsImage = async (
  prompt: string, 
  qubitsPhotoBase64?: string,
  includeHumans: boolean = false
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstruction = getSystemPrompt(includeHumans);
  
  const parts: any[] = [
    { text: `System Instruction: ${systemInstruction}` },
    { text: `User Scene Request: ${prompt}` }
  ];

  if (qubitsPhotoBase64) {
    const base64Data = qubitsPhotoBase64.includes(',') 
      ? qubitsPhotoBase64.split(',')[1] 
      : qubitsPhotoBase64;
    parts.push({
      text: "Reference Photo: Use the Qubits structure found here. " + 
            (includeHumans ? "Also include the person from this photo in the new scene." : "IGNORE any people in this photo.")
    });
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

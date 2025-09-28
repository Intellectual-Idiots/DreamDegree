import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env.local");
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are an expert vision assistant. 
You will receive a South African Matriculant's transcript (Grade 12/11 final results). 
Your role is to:
1. Analyze the transcript image carefully.  
2. Extract all the subjects and their marks as percentages.  
3. Write out subject names in full (no abbreviations, e.g., "Maths" → "Mathematics", "Afr" → "Afrikaans", "English" → "English Home Language" , "Life Sciences" → "Life Sciences").  
4. Return **strictly a JSON object** with the structure:  

{
  "subjects": [
    { "name": "English Home Language", "mark": 72 },
    { "name": "Mathematics", "mark": 65 },
    { "name": "Physical Sciences", "mark": 70 }
  ]
}

⚠️ Do not include explanations, commentary, or extra text — output only valid JSON.
Do not include markdown formatting, code fences, or explanations.
`;

const userPrompt = `
Analyze the following image of a South African Matriculant's transcript (Grade 12/11 final results) and return the subjects and their marks as percentages.
`;

const imageUrl = "https://groundup.org.za/media/uploads/images/Graphics/matricresults/image2.jpg";


async function main(): Promise<void> {
  try {
    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: systemPrompt
        },
            
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "auto"
                }
              }
            ]
          }
        ],
      
      });
      

    console.log( response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error in vision call:", error);
  }
}

main();

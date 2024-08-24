import express from 'express';
import { generateText } from '../services/xsell';
import { selectPersona } from '../utils/personaSelector';
import { prospectFormat } from '../utils/prospectJsonFormat';

export const xsellProspectsRouter = express.Router();

/*Here I'm tackling a specific challenge - ensuring a cohesive and well-structured output. 
For that I am utilizing my JSON prompt framework for small language models. 

For the specific case of using Granite, the JSON prompt framework that is utizlied is cohesive,
and utilizes multiple prompt techniques to ensure the assistant provides a structured data output. 

We have additional helpers (cleaners) and failsafes (recursion up to 5 times, manual parsing)
to ensure that we achieve a consistent output. 

The JSON prompt is not only FAST, but it also ensures that the response of the model 
is COHESIVE in all aspects - providing a singular persona 
that can be broken down and utilized as data in 
numerous aspects */

const createProspectGenerationPrompt = (persona: string) => `
The assistant is a JSON-ready array generator that generates the JSON as if it is filled by ${persona}.
      The assistant only provides the JSON array as a response.
      The assistant always starts their response with the { of the array and ends with the } of the array.
      The full contents of the response of the assistant include solely the JSON array in the expected fashion. 
      Each assistant output is sent directly to a JSON-ready application that expects the singular output from the assistant and nothing else.
    
      The assistant never provides any explanation, reasoning, or other unnecessary information.
    
      The assistant only provides the JSON response array related to the product, without an array for the comments.
      The assistant provides no explanation, reasoning, or any other terms, words, tokens, or otherwise irrelevant text.
      
      The assistant generates a JSON array that fits the criteria explained in JSON Rules & Structure.txt and is generated based on Strict JSON Generation Execution Pattern.txt
      The output of the assistant is restricted to only the specified JSON array and nothing else. 
      The assistant does not include any additional content or response beyond content that follows the exact JSON structure explained in JSON Rules & Structure.txt

To generate the JSON array the assistant first internally computers the instructions in Strict JSON Generation Execution Pattern.txt and then generates the JSON Array per the structure in JSON Rules & Structure.txt

The user provides product information about the business in a JSON format, the assistant must return a perfect persona. 

JSON Rules & Structure.txt
"""
{
  "persona": {
    "name": "string", //come up with a realisitc name!
    "age": "number",
    "jobTitle": "string",
    "company": {
      "size": "string",
      "industry": "string"
    },
    "goals": ["string"],
    "challenges": ["string"],
    "preferences": {
      "communicationChannel": "string",
      "decisionMakingStyle": "string"
    },
    "buyingJourney": {
      "stage": "string",
      "timelineToDecision": "string",
      "budgetAuthority": "string"
    },
    "interests": ["string"],
    "painPoints": ["string"],
    "decisionCriteria": ["string"]
  }
}
"""

1. Without mentioning or explicitly referencing it, emulate ${persona} and use that perspective to inform the prospect generation.
2. Generate a prospect profile using the following JSON structure. Ensure all fields are filled with realistic and coherent data:
3. Ensure all numerical values use the full range of the 0-10 scale where applicable.
4. Make sure the generated prospect aligns with the company information provided and the emulated ${persona}'s vision.
5. The JSON must be valid and exactly match the given structure.
6. Do not include any text outside the JSON structure in your response.
!IMPORTANT! The persona must have a unique and lesser known name. (avoid John Doe)

Generate a JSON prospect profile in the extact structure above based on the following company information:
`;

function cleanJsonString(jsonString: string): string {
    console.log('Original JSON string:', jsonString);
    
    // Remove any leading/trailing whitespace
    jsonString = jsonString.trim();
  
    // If the string doesn't start with '{', find the first occurrence
    const jsonStart = jsonString.indexOf('{');
    // If the string doesn't end with '}', find the last occurrence
    const jsonEnd = jsonString.lastIndexOf('}');
  
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    } else {
      console.error('Invalid JSON structure');
      throw new Error('Invalid JSON structure');
    }
  
    // Replace escaped newlines with actual newlines
    jsonString = jsonString.replace(/\\n/g, '\n');
    
    // Replace double backslashes with single backslashes
    jsonString = jsonString.replace(/\\\\/g, '\\');
  
    // Unescape double quotes
    jsonString = jsonString.replace(/\\"/g, '"');
  
    // Remove any remaining backslashes before quotes
    jsonString = jsonString.replace(/\\(?=")/g, '');
  
    console.log('Cleaned JSON string:', jsonString);
    return jsonString;
  }


function parseJSON(content: string): any | null {
    try {
      // First, try standard JSON.parse
      return JSON.parse(content);
    } catch (err) {
      console.error('Standard JSON.parse failed. Attempting manual parse.');
      try {
        // Manual parsing
        const result: any = {};
        const lines = content.split('\n');
        let currentKey = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('"') && trimmed.includes('":')) {
            const parts = trimmed.split('":');
            currentKey = parts[0].replace(/"/g, '').trim();
            const value = parts[1].trim();
            if (value.endsWith(',')) {
              result[currentKey] = value.slice(0, -1).trim();
            } else {
              result[currentKey] = value;
            }
          } else if (currentKey) {
            result[currentKey] += '\n' + trimmed;
          }
        }
        // Clean up the values
        for (const key in result) {
          if (result[key].startsWith('"') && result[key].endsWith('"')) {
            result[key] = result[key].slice(1, -1);
          }
        }
        console.log('Manually parsed JSON:', result);
        return result;
      } catch (manualErr) {
        console.error('Manual JSON parsing failed:', manualErr);
        return null;
      }
    }
  }

async function generateJSONCustomAiIBM(input: string, retryCount = 0): Promise<any> {
  try {
    const { persona } = selectPersona();
    const prospectGenerationPrompt = createProspectGenerationPrompt(persona);
    const fullInput = `<|system|>\n${prospectGenerationPrompt}\n<|user|>\n${input}\n<|assistant|>\n`;
    
    const result = await generateText(fullInput);
    
    const generatedText = result.results[0].generated_text.trim();
    console.log(generatedText);
    const cleanedJsonString = cleanJsonString(generatedText);
    const parsedResponse = parseJSON(cleanedJsonString);

    if (!parsedResponse) {
      if (retryCount < 5) {
        console.info(`Retrying IBM Watson query, retry count: ${retryCount + 1}`);
        return await generateJSONCustomAiIBM(input, retryCount + 1);
      } else {
        throw new Error("Exceeded retry attempts for getting JSON response from IBM Watson");
      }
    }

    return {
      output: parsedResponse
    };
  } catch (error) {
    console.error('Error generating custom AI response:', error);
    throw error;
  }
}

xsellProspectsRouter.post('/generate-prospect', async (req, res) => {
  try {
    const { companyInfo } = req.body;
    const result = await generateJSONCustomAiIBM(JSON.stringify(companyInfo)); 
    
    res.json({
      prospect: result.output,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      model: result.model,
    });
  } catch (error) {
    console.error('Error generating prospect:', error);
    res.status(500).json({ error: 'An error occurred while generating the prospect profile.' });
  }
});


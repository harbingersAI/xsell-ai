import express from 'express';
import { generateText } from '../services/xsell';
import { selectPersona } from '../utils/personaSelector';

export const xsellProposalRouter = express.Router();

const createProposalGenerationPrompt = (persona: string) => `
The assistant is a JSON-ready object generator that generates the JSON as if it is filled by ${persona}.
The assistant only provides the JSON object as a response.
The assistant always starts their response with the { of the object and ends with the } of the object.
The full contents of the response of the assistant include solely the JSON object in the expected fashion. 
Each assistant output is sent directly to a JSON-ready application that expects the singular output from the assistant and nothing else.

The assistant never provides any explanation, reasoning, or other unnecessary information.

The assistant only provides the JSON response object related to the proposal, without any additional arrays or objects.
The assistant provides no explanation, reasoning, or any other terms, words, tokens, or otherwise irrelevant text.

The assistant generates a JSON object that fits the criteria explained in JSON Rules & Structure.txt and is generated based on Strict JSON Generation Execution Pattern.txt
The output of the assistant is restricted to only the specified JSON object and nothing else. 
The assistant does not include any additional content or response beyond content that follows the exact JSON structure explained in JSON Rules & Structure.txt

To generate the JSON object the assistant first internally computes the instructions in Strict JSON Generation Execution Pattern.txt and then generates the JSON Object per the structure in JSON Rules & Structure.txt

The user provides company information and a prospect profile in a JSON format, the assistant must return a perfect proposal structure.

JSON Rules & Structure.txt
"""
{
  "executiveSummary": {
    "keyPoints": ["string"]
  },
  "problemStatement": {
    "identifiedIssues": ["string"]
  },
  "proposedSolution": {
    "overview": "string",
    "keyFeatures": ["string"]
  },
  "benefitsAndROI": {
    "benefits": ["string"],
    "estimatedROI": "string"
  },
  "implementationPlan": {
    "phases": [
      {
        "name": "string",
        "duration": "string",
        "keyActivities": ["string"]
      }
    ]
  },
  "pricingAndTerms": {
    "pricingModel": "string",
    "paymentTerms": "string",
    "additionalNotes": ["string"]
  },
  "nextSteps": ["string"]
}
"""

1. Without mentioning or explicitly referencing it, emulate ${persona} and use that perspective to inform the proposal generation.
2. Generate a proposal structure using the following JSON structure. Ensure all fields are filled with realistic and coherent data:
3. Make sure the generated proposal aligns with the company information and prospect profile provided.
4. The JSON must be valid and exactly match the given structure.
5. Do not include any text outside the JSON structure in your response.
6. Ensure the proposal is tailored to the specific needs, challenges, and goals of the prospect.

Generate a JSON proposal structure based on the following company information and prospect profile:
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
        let currentObject: any = result;
        const stack: any[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{')) {
            stack.push(currentObject);
            currentObject = {};
          } else if (trimmed.startsWith('}')) {
            if (stack.length > 0) {
              currentObject = stack.pop();
            }
          } else if (trimmed.startsWith('"') && trimmed.includes('":')) {
            const parts = trimmed.split('":');
            currentKey = parts[0].replace(/"/g, '').trim();
            const value = parts[1].trim();
            if (value.startsWith('{')) {
              currentObject[currentKey] = {};
              stack.push(currentObject);
              currentObject = currentObject[currentKey];
            } else if (value.startsWith('[')) {
              currentObject[currentKey] = [];
            } else if (value.endsWith(',')) {
              currentObject[currentKey] = value.slice(0, -1).trim().replace(/^"/, '').replace(/"$/, '');
            } else {
              currentObject[currentKey] = value.replace(/^"/, '').replace(/"$/, '');
            }
          } else if (trimmed.startsWith('-')) {
            if (Array.isArray(currentObject[currentKey])) {
              currentObject[currentKey].push(trimmed.slice(1).trim().replace(/^"/, '').replace(/"$/, ''));
            }
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
    const proposalGenerationPrompt = createProposalGenerationPrompt(persona);
    const fullInput = `<|system|>\n${proposalGenerationPrompt}\n<|user|>\n${input}\n<|assistant|>\n`;
    
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

xsellProposalRouter.post('/generate', async (req, res) => {
  try {
    const { companyInfo, prospectProfile } = req.body;
    const input = `
Company Information:
${JSON.stringify(companyInfo, null, 2)}

Prospect Profile:
${JSON.stringify(prospectProfile, null, 2)}
`;
    const result = await generateJSONCustomAiIBM(input);
    
    res.json({
      proposal: result.output,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      model: result.model,
    });
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({ error: 'An error occurred while generating the proposal structure.' });
  }
});

export default xsellProposalRouter;
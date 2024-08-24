import express from 'express';
import { generateText } from '../services/xsell';
import { selectPersona } from '../utils/personaSelector';

export const xsellRouter = express.Router();

const createXSellPrompt = (companyInfo: any) => `
You are [X]Sell AI, an advanced AI sales assistant designed to help sales professionals excel in their roles. Your knowledge encompasses a wide range of sales strategies, techniques, and best practices across various industries. You have been trained with the following company information:

${JSON.stringify(companyInfo, null, 2)}

Your task is to provide expert advice, strategies, and insights tailored to the user's specific sales-related queries. When responding:
!IMPORTANT! PROVIDE A CONCISE RESPONSE.
1. Always maintain a professional, knowledgeable, and supportive tone.
2. Provide specific, actionable advice that can be immediately applied.
3. Use examples and scenarios to illustrate your points when appropriate.
4. If relevant, reference industry trends or data to support your recommendations.
5. Tailor your responses to align with the company's industry, size, and target market.
6. When appropriate, suggest tools or techniques that [X]Sell offers to address the user's needs.
7. If a query is unclear or lacks context, ask for clarification to provide the most accurate and helpful response.
8. Encourage best practices in ethical sales and customer relationship management.

Remember, your goal is to empower sales professionals to improve their performance and achieve better results. Be concise yet comprehensive in your responses.
`;
/*Inside the SalesTip Prompt you'll see the ${persona} being utilized. This is utilized in other prompts throughout the demo app. 
The core reason for the persona selector and the sales personas list inside the utils folder is to provide further diversity
in the responses of the application. 

Whenver we require a strict response - i.e. a sales tip that is actually helpful - and we provide a lot of data (the business data)
the small model tends to provide a similar, if not EXACT response every time. 

That's why the added sales personas and persona selectors add variety and randomness - offering a unique perspective and voice 
to ensure both high-quality of the output and high relevance to the subject matter,
while staying true to the human-like expertise and nature of the experience.*/

const createSalesTipSystemPrompt = (persona: string) => `
You are [X]Sell AI, an expert AI sales assistant for [X]Sell, a powerful B2B sales enhancement tool. Your task is to generate a unique, powerful sales tip tailored for the given company. Your tips should be actionable, innovative, and directly related to the company's specifics.

Follow these instructions:
1. Without mentioning or explicitly referencing it, emulate ${persona} and based on that perspective, generate a tip for the company.
2. Consider the following aspects of the company:
   - The company's industry and its current trends
   - The company's unique selling proposition (USP)
   - Their key products or services
   - Their target audience and the pain points they solve
   - Potential areas for improvement or expansion in their sales approach
   - The current economic climate and its impact on the company's market

3. Generate a sales tip inspired by the selected emulated perspective. 
4. The tip should be concise (2-3 sentences) and immediately applicable. Remember, you are [X]Sell AI providing this tip, not the persona.

Additional Notes:
1. Always maintain your identity as [X]Sell AI throughout your response.
2. You are [X]Sell AI.
3. Your job is [X]Sell AI - the best AI sales assistant.
4. Your main generation task is to generate a 2-3 sentence tip.
5. You always follow the aforementioned instructions.
6. You are strict in your succint nature.
7. You emulate the perspective
8. You are the best. `;

/*Additional instruction no. 8 is provided to ensure improved confidence in the resopnse, and a positive overtone.*/


// Original generic route
xsellRouter.post('/', async (req, res) => {
  try {
    const { input, companyInfo } = req.body;
    const systemPrompt = createXSellPrompt(companyInfo);
    const fullInput = `<|system|>\n${systemPrompt}\n<|user|>\n${input}\n<|assistant|>\n`;
    
    const result = await generateText(fullInput);
    
    res.json(result);
  } catch (error) {
    console.error('Error in XSell route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// New specialized route for generating sales tips
xsellRouter.post('/generate-tip', async (req, res) => {
  try {
    const { companyInfo } = req.body;
    const { persona, seed } = selectPersona();
    const salesTipSystemPrompt = createSalesTipSystemPrompt(persona);
    const input = `<|system|>\n${salesTipSystemPrompt}\n<|user|>\nGenerate a sales tip based on the following company information:\n${JSON.stringify(companyInfo)}\n<|assistant|>\n`;
    
    const result = await generateText(input);
    
    // Extract the generated tip from the response
    const generatedTip = result.results[0].generated_text.trim();
    
    res.json({ tip: generatedTip, seed });
  } catch (error) {
    console.error('Error generating sales tip:', error);
    res.status(500).json({ error: 'An error occurred while generating the sales tip.' });
  }
});
import { Router } from 'express';
import { generateText } from '../services/xsell';
import { selectPersona } from '../utils/personaSelector';

export const xsellGeneratorRouter = Router();

/* This page is a bit more of a generic example of a generator prompt - where we can create 
multiple prompt types, while still ensuring a more randomized emulation via the personaSelector (explained better in xsell.ts routes)

We specify the development of the distinct brand voice after the emulation, 
and we provide the company information in the system prompt itself
ensuring further consistency and quality of the output */


const createPrompt = (persona: string, companyInfo: any, type: string, additionalInfo: string) => `
You are [X]Sell AI, an expert AI sales assistant embodying the perspective of ${persona}. Your task is to generate ${type} content for a B2B sales scenario. Create a unique and compelling brand voice that will resonate with both the specified company and its potential customers.

Company Information:
${JSON.stringify(companyInfo, null, 2)}

Additional Information:
${additionalInfo}

Instructions:
1. Analyze the company information and additional details provided.
2. Develop a distinct brand voice that aligns with the company's industry, values, and target audience.
3. Generate ${type} content that reflects this brand voice and addresses the specific scenario.
4. Ensure the content is engaging, persuasive, and tailored to the company's needs.
5. Incorporate industry-specific language and trends where appropriate.
6. Keep the tone professional yet personable, striking a balance between formal and conversational.

Generate the ${type} content:
`;

xsellGeneratorRouter.post('/outreach', async (req, res) => {
  try {
    const { companyInfo, recipient } = req.body;
    const { persona } = selectPersona();
    const additionalInfo = `Recipient: ${recipient || 'Not specified'}`;
    const prompt = createPrompt(persona, companyInfo, 'outreach email', additionalInfo);
    const result = await generateText(prompt);
    res.json({ content: result.results[0].generated_text.trim() });
  } catch (error) {
    console.error('Error generating outreach content:', error);
    res.status(500).json({ error: 'An error occurred while generating the outreach content.' });
  }
});

xsellGeneratorRouter.post('/agenda', async (req, res) => {
  try {
    const { companyInfo, callInfo } = req.body;
    const { persona } = selectPersona();
    const additionalInfo = `Call Information: ${callInfo}`;
    const prompt = createPrompt(persona, companyInfo, 'meeting agenda', additionalInfo);
    const result = await generateText(prompt);
    res.json({ content: result.results[0].generated_text.trim() });
  } catch (error) {
    console.error('Error generating agenda content:', error);
    res.status(500).json({ error: 'An error occurred while generating the agenda content.' });
  }
});

xsellGeneratorRouter.post('/follow-up', async (req, res) => {
  try {
    const { companyInfo, caseInfo } = req.body;
    const { persona } = selectPersona();
    const additionalInfo = `Case/Situation Information: ${caseInfo}`;
    const prompt = createPrompt(persona, companyInfo, 'follow-up email', additionalInfo);
    const result = await generateText(prompt);
    res.json({ content: result.results[0].generated_text.trim() });
  } catch (error) {
    console.error('Error generating follow-up content:', error);
    res.status(500).json({ error: 'An error occurred while generating the follow-up content.' });
  }
});
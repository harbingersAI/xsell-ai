import { Router } from 'express';
import { generateText } from '../services/xsell';

export const objectionHandlerRouter = Router();

/* Here the prompt work is structured, showcasing a consistency in the exact output related to the structure */

const objectionHandlerPrompt = `
You are [X]Sell AI, a highly advanced sales assistant specializing in objection handling. Your task is to analyze the given sales situation and provide detailed, actionable responses to potential objections. Your expertise includes deep understanding of customer psychology, sales techniques, and industry-specific knowledge.

Given the sales situation, you must:
1. Identify at least 3 potential objections based on the provided information.
2. For each objection, provide a detailed, strategic response.
3. Conduct a psychometric analysis of the customer's potential thought patterns and motivations.
4. Suggest tailored approaches to address the customer's underlying concerns.

Format your response in HTML markup, using appropriate tags to structure the content. Include the following sections:

<objections>
  <objection>
    <issue>Describe the potential objection</issue>
    <response>Provide a detailed, strategic response to the objection</response>
  </objection>
  <!-- Repeat for each objection (minimum 3) -->
</objections>

<psychometric-analysis>
  Provide a deep dive into the customer's potential thought patterns, motivations, and underlying concerns. Use subheadings and paragraphs as appropriate.
</psychometric-analysis>

<tailored-approaches>
  <approach>
    <strategy>Describe a tailored strategy to address the customer's concerns</strategy>
    <rationale>Explain the reasoning behind this approach</rationale>
  </approach>
  <!-- Include at least 2 tailored approaches -->
</tailored-approaches>

Ensure your response is comprehensive, insightful, and directly applicable to the given sales situation.
`;

objectionHandlerRouter.post('/', async (req, res) => {
  try {
    const { salesSituation } = req.body;
    
    if (!salesSituation) {
      return res.status(400).json({ error: 'Sales situation is required' });
    }

    const fullPrompt = `${objectionHandlerPrompt}\n\nSales Situation:\n${salesSituation}\n\nProvide your analysis and recommendations:`;
    
    const result = await generateText(fullPrompt);
    
    if (!result || !result.results || !result.results[0] || !result.results[0].generated_text) {
      throw new Error('Invalid response from AI service');
    }

    const generatedContent = result.results[0].generated_text.trim();

    res.json({ 
      content: generatedContent,
      tokens: {
        prompt: result.results[0].input_token_count,
        completion: result.results[0].generated_token_count
      }
    });
  } catch (error) {
    console.error('Error in objection handler:', error);
    res.status(500).json({ error: 'An error occurred while processing the objection handling request.' });
  }
});

export default objectionHandlerRouter;
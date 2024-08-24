import axios from 'axios';
import { getIAMToken } from './auth';

export const generateText = async (input: string, modelId: string = 'ibm/granite-13b-chat-v2'): Promise<any> => {
  const url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";

  try {
    const iamToken = await getIAMToken(process.env.IBM_API_KEY || '');

    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${iamToken}`
    };

    const body = {
      input,
      parameters: {
        decoding_method: "greedy",
        max_new_tokens: 900,
        min_new_tokens: 0,
        stop_sequences: [],
        repetition_penalty: 1.05
      },
      model_id: modelId,
      project_id: process.env.IBM_PROJECT_ID
    };

    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error('Error calling IBM Watson API:', error);
    throw error;
  }
};


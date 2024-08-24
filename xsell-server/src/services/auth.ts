import axios from 'axios';

const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

export async function getIAMToken(apiKey: string): Promise<string> {
  try {
    const response = await axios.post(IAM_TOKEN_URL, null, {
      params: {
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining IAM token:', error);
    throw new Error('Failed to obtain IAM token');
  }
}
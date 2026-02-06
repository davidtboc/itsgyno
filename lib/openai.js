import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_PROMPT =
  'Analyze this chest image for gynecomastia. Return a concise verdict and rationale.';

export async function analyzeGynecomastiaImage({ imageBase64 }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: ANALYSIS_PROMPT,
          },
          {
            type: 'input_image',
            image_url: imageBase64,
          },
        ],
      },
    ],
  });

  const outputText = response.output_text || '';
  const normalized = outputText.toLowerCase();

  const verdict = normalized.includes('yes')
    ? 'Yes, you appear to have gyno.'
    : 'No, you do not seem to have gyno.';

  return {
    verdict,
    explanation:
      outputText ||
      'Unable to generate a detailed explanation. Please retry with a clearer image.',
  };
}

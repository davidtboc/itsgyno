import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a medical AI assistant specializing in gynecomastia detection. You must follow a strict evaluation process:

STEP 1 - IMAGE VALIDATION:
First, determine if the image(s) show a male chest. If the image shows:
- A non-human subject (animals, objects, landscapes, etc.)
- A female chest
- A clothed chest where skin is not visible
- Body parts other than the chest area
- Blurry, dark, or unidentifiable content
Then respond with RESULT: NO and explain that the image is not suitable for analysis.

STEP 2 - CLARITY CHECK:
If it IS a male chest, check if the areolas (nipple area) are clearly visible. The areolas must be visible to assess for gynecomastia. If the areolas are:
- Not visible in the image
- Too blurry to assess
- Covered or obscured
- At an angle that prevents proper assessment
Then respond with RESULT: NO and explain that the images are not clear enough for accurate analysis.

STEP 3 - GYNECOMASTIA ASSESSMENT (only if Steps 1 and 2 pass):
Look for these signs of gynecomastia:
- Puffy or swollen nipples that protrude outward
- Dome-shaped or cone-shaped breast tissue behind the areola
- Visible breast tissue extending beyond the areola
- Asymmetry where one side appears more enlarged
- The "puffy nipple" appearance where the areola/nipple complex is raised

Compare against normal male chest characteristics:
- Flat chest contour
- Nipples that lie flat against the chest
- No visible breast tissue mound

RESPONSE FORMAT - Use EXACTLY this format:
RESULT: [YES or NO]
EXPLANATION: [2-3 sentences explaining your determination]

EXPLANATION GUIDELINES:

For NO results (no gynecomastia detected):
- Emphasize there are no visible signs of gynecomastia
- Note the absence of enlarged glandular tissue behind the areola
- State that from a visual perspective, there is no noticeable grade of gynecomastia
- Mention the chest appears to have normal male contour with flat-lying nipples

For YES results (gynecomastia detected):
- Briefly explain WHY gynecomastia is suspected (e.g., puffy nipples, dome-shaped tissue, protrusion)
- Identify the apparent GRADE of gynecomastia:
  * Grade 1: Minor enlargement, no excess skin - small amount of tissue around the areola
  * Grade 2: Moderate enlargement, no excess skin - more noticeable breast tissue extending beyond areola
  * Grade 3: Moderate enlargement with excess skin - visible breast mound with some skin laxity
  * Grade 4: Marked enlargement with excess skin - significant breast tissue resembling female breast
- Describe what the grade looks like in the specific images

Important guidelines:
- Be conservative - only say YES if there are clear, visible signs of gynecomastia
- If images are unsuitable or unclear, always say NO with appropriate explanation
- Do not diagnose based on body fat alone - gynecomastia is glandular tissue, not fat
- Be professional and sensitive in your explanation`;

const USER_PROMPT =
  'Please analyze these chest image(s) for signs of gynecomastia. First verify the images are suitable (showing a clear male chest with visible areolas), then provide your assessment.';

export async function analyzeGynecomastiaImage({
  imageBase64,
  imageBase64Second,
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
    throw new Error('Primary image is not a valid data URL.');
  }

  if (imageBase64Second && !imageBase64Second.startsWith('data:image/')) {
    throw new Error('Second image is not a valid data URL.');
  }

  const imageInputs = [
    {
      type: 'input_image',
      image_url: imageBase64,
    },
  ];

  if (imageBase64Second) {
    imageInputs.push({
      type: 'input_image',
      image_url: imageBase64Second,
    });
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: USER_PROMPT },
          ...imageInputs.map((image) => ({
            type: 'image_url',
            image_url: { url: image.image_url },
          })),
        ],
      },
    ],
  });

  const outputText = response.choices?.[0]?.message?.content || '';
  const resultMatch = outputText.match(/RESULT:\s*(YES|NO)/i);
  const explanationMatch = outputText.match(/EXPLANATION:\s*([\s\S]+)/i);
  const resultValue = resultMatch?.[1]?.toUpperCase();

  const verdict =
    resultValue === 'YES'
      ? 'Yes, you appear to have gyno.'
      : 'No, you do not seem to have gyno.';

  return {
    verdict,
    explanation:
      explanationMatch?.[1]?.trim() ||
      'The analysis did not return a structured explanation. Please try again with clearer, well-lit images that show the full chest and visible areolas.',
  };
}

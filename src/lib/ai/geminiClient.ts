// Note: This module is intended for server-side use only.
// Never use NEXT_PUBLIC_ env vars for API keys.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiRequest {
  contents: GeminiContent[];
}

async function callGeminiAPI(request: GeminiRequest, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateSvgFromPrompt(prompt: string, imageBase64?: string): Promise<string> {
  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const systemPrompt = `You are an SVG generation expert. Generate a clean, valid SVG based on the user's description.
Rules:
- Return ONLY valid SVG code, no markdown, no explanation
- Use SVG namespace: xmlns="http://www.w3.org/2000/svg"
- Set appropriate width and height (e.g., 200x200 or 400x400)
- Use simple, clean shapes
- Apply appropriate colors and styling
- The SVG must be self-contained`;

  const parts: GeminiPart[] = [
    { text: `${systemPrompt}\n\nUser request: ${prompt}` },
  ];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64,
      },
    });
  }

  const result = await callGeminiAPI({ contents: [{ parts }] }, apiKey);

  // Extract SVG from response
  const svgMatch = result.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) {
    throw new Error('No valid SVG found in AI response');
  }

  return svgMatch[0];
}

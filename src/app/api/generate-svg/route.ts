import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  const { prompt, imageBase64 } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    // Return a demo SVG when no API key is configured
    const demoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect x="50" y="50" width="100" height="100" fill="#4488ff" stroke="#2266cc" stroke-width="2" rx="10"/>
  <circle cx="100" cy="100" r="30" fill="white" opacity="0.8"/>
  <text x="100" y="105" text-anchor="middle" fill="#2266cc" font-size="12" font-family="Arial">Demo</text>
</svg>`;
    return NextResponse.json({ svg: demoSvg });
  }

  try {
    const systemPrompt = `You are an SVG generation expert. Generate a clean, valid SVG based on the user's description.
Rules:
- Return ONLY valid SVG code, no markdown, no explanation, no code fences
- Use SVG namespace: xmlns="http://www.w3.org/2000/svg"
- Set appropriate width and height (200-400px range)
- Use simple, clean shapes
- Apply appropriate colors and styling
- The SVG must be self-contained and valid`;

    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
    if (!svgMatch) {
      throw new Error('No valid SVG found in AI response');
    }

    return NextResponse.json({ svg: svgMatch[0] });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate SVG' },
      { status: 500 }
    );
  }
}

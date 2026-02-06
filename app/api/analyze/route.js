import { NextResponse } from 'next/server';
import { analyzeGynecomastiaImage } from '../../../lib/openai';

export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 in request body.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeGynecomastiaImage({ imageBase64 });
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image.' },
      { status: 500 }
    );
  }
}

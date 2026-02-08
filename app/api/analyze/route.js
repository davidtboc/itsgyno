import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';
import { analyzeGynecomastiaImage } from '../../../lib/openai';

export async function POST(request) {
  try {
    const { imageBase64, imageBase64Second, checkoutSessionId } =
      await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 in request body.' },
        { status: 400 }
      );
    }

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: 'Missing checkoutSessionId in request body.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed.' },
        { status: 402 }
      );
    }

    const analysis = await analyzeGynecomastiaImage({
      imageBase64,
      imageBase64Second,
    });
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image.' },
      { status: 500 }
    );
  }
}

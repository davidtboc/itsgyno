import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';
import { analyzeGynecomastiaImage } from '../../../lib/openai';

export const runtime = 'nodejs';

const MAX_IMAGE_DATA_URL_LENGTH = 10_000_000;

function isValidImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

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

    if (!isValidImageDataUrl(imageBase64)) {
      return NextResponse.json(
        { error: 'Primary image must be a valid image data URL.' },
        { status: 400 }
      );
    }

    if (imageBase64.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json(
        { error: 'Primary image is too large.' },
        { status: 413 }
      );
    }

    if (imageBase64Second && !isValidImageDataUrl(imageBase64Second)) {
      return NextResponse.json(
        { error: 'Second image must be a valid image data URL.' },
        { status: 400 }
      );
    }

    if (
      imageBase64Second &&
      imageBase64Second.length > MAX_IMAGE_DATA_URL_LENGTH
    ) {
      return NextResponse.json(
        { error: 'Second image is too large.' },
        { status: 413 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (session.mode !== 'payment') {
      return NextResponse.json(
        { error: 'Invalid checkout session mode.' },
        { status: 400 }
      );
    }

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed.' },
        { status: 402 }
      );
    }

    if (session.metadata?.purpose !== 'gyno_analysis') {
      return NextResponse.json(
        { error: 'Invalid checkout session purpose.' },
        { status: 400 }
      );
    }

    if (!session.amount_total || session.amount_total <= 0) {
      return NextResponse.json(
        { error: 'Invalid checkout session amount.' },
        { status: 400 }
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

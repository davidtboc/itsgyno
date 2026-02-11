import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing STRIPE_PRICE_ID configuration.' },
        { status: 500 }
      );
    }

    const originHeader = request.headers.get('origin');
    const host = request.headers.get('host');
    const protocol = host && host.includes('localhost') ? 'http' : 'https';
    const fallbackOrigin = host ? `${protocol}://${host}` : '';
    const origin =
      originHeader ||
      fallbackOrigin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL;

    if (!origin) {
      return NextResponse.json(
        { error: 'Unable to resolve application origin.' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Unable to create checkout session.',
        code: error.code || null,
        type: error.type || null,
      },
      { status: 500 }
    );
  }
}

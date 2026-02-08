import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id query parameter.' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Unable to retrieve session status.' },
      { status: 500 }
    );
  }
}

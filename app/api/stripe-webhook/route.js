import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing stripe-signature header.', { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new NextResponse('Missing STRIPE_WEBHOOK_SECRET.', { status: 500 });
  }

  let event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.info('Checkout session completed:', session.id);
  }

  return NextResponse.json({ received: true });
}

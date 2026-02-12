import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  maxNetworkRetries: 2,
});

export default stripe;

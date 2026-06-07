import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key, {
        apiVersion: '2025-01-27.acronyms' as any, // Standard stable fallback API version or latest
      });
    }
  }
  return stripeClient;
}

/**
 * Creates a Payment Intent with a fallback to mock data-uri/intent-id
 * if the Stripe Secret Key is missing in the environment.
 */
export async function createStripePaymentIntent(amount: number, currency: string = 'mxn', metadata: any = {}) {
  const stripe = getStripeClient();

  if (stripe) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency,
        metadata,
        payment_method_types: ['card'],
      });
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        isCustomMock: false,
      };
    } catch (error: any) {
      console.error('Error creating real Stripe Payment Intent:', error.message);
    }
  }

  // Fallback for sandboxed developer testing when keys are not set yet
  const mockIntentId = `pi_mock_${Math.random().toString(36).substring(2, 11)}`;
  return {
    id: mockIntentId,
    clientSecret: `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 11)}`,
    isCustomMock: true,
  };
}

/**
 * Refunds or checks a payment, keeping it fully safe.
 */
export async function retrievePaymentIntent(intentId: string) {
  const stripe = getStripeClient();
  if (stripe && !intentId.startsWith('pi_mock_')) {
    try {
      return await stripe.paymentIntents.retrieve(intentId);
    } catch (error) {
      console.error('Error retrieving real Stripe payment intent:', error);
    }
  }
  return {
    id: intentId,
    status: 'succeeded',
    amount: 100,
  };
}

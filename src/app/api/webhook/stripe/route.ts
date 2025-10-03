import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { database } from '@/lib/firebase';
import { ref, push, update } from 'firebase/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  if (!database) {
    console.error('Database not initialized');
    return;
  }

  const donationData = {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Convert from cents
    currency: paymentIntent.currency,
    donorName: paymentIntent.metadata.donorName,
    donorEmail: paymentIntent.metadata.donorEmail,
    donorPhone: paymentIntent.metadata.donorPhone,
    isAnonymous: paymentIntent.metadata.isAnonymous === 'true',
    purpose: paymentIntent.metadata.purpose,
    dedication: paymentIntent.metadata.dedication,
    isRecurring: paymentIntent.metadata.isRecurring === 'true',
    paymentMethod: 'stripe',
    paymentIntentId: paymentIntent.id,
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    receiptSent: false,
  };

  try {
    // Save to donations collection
    const donationsRef = ref(database, 'donations');
    const newDonationRef = push(donationsRef);
    await update(newDonationRef, donationData);

    // Update analytics
    const analyticsRef = ref(database, 'analytics/donations');
    const totalRef = ref(database, 'analytics/donations/total');
    const countRef = ref(database, 'analytics/donations/count');
    
    // Get current totals
    const totalSnapshot = await new Promise((resolve) => {
      const unsubscribe = totalRef.on('value', (snap) => {
        unsubscribe();
        resolve(snap.val() || 0);
      });
    });
    
    const countSnapshot = await new Promise((resolve) => {
      const unsubscribe = countRef.on('value', (snap) => {
        unsubscribe();
        resolve(snap.val() || 0);
      });
    });

    // Update totals
    await update(analyticsRef, {
      total: (totalSnapshot as number) + donationData.amount,
      count: (countSnapshot as number) + 1,
      lastUpdated: new Date().toISOString(),
    });

    console.log('Donation recorded successfully:', donationData.id);
  } catch (error) {
    console.error('Error saving donation:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  if (!database) {
    console.error('Database not initialized');
    return;
  }

  const donationData = {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    donorName: paymentIntent.metadata.donorName,
    donorEmail: paymentIntent.metadata.donorEmail,
    donorPhone: paymentIntent.metadata.donorPhone,
    isAnonymous: paymentIntent.metadata.isAnonymous === 'true',
    purpose: paymentIntent.metadata.purpose,
    dedication: paymentIntent.metadata.dedication,
    isRecurring: paymentIntent.metadata.isRecurring === 'true',
    paymentMethod: 'stripe',
    paymentIntentId: paymentIntent.id,
    status: 'failed',
    createdAt: new Date().toISOString(),
    failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
  };

  try {
    const donationsRef = ref(database, 'donations');
    const newDonationRef = push(donationsRef);
    await update(newDonationRef, donationData);
    
    console.log('Failed donation recorded:', donationData.id);
  } catch (error) {
    console.error('Error saving failed donation:', error);
  }
}

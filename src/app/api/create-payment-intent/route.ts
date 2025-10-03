import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const { amount, currency, donorInfo, purpose, dedication, isRecurring } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Minimum donation amount is ₱50' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'php',
      metadata: {
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        donorPhone: donorInfo.phone || '',
        isAnonymous: donorInfo.isAnonymous.toString(),
        purpose: purpose,
        dedication: dedication || '',
        isRecurring: isRecurring.toString(),
      },
      description: `Donation to StreetPaws - ${purpose}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

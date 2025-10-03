import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

export async function POST(req: NextRequest) {
  try {
    if (!database) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await req.json();
    const {
      amount,
      donorName,
      donorEmail,
      donorPhone,
      purpose,
      message,
      referenceNumber,
      screenshots = [],
    } = body || {};

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum donation amount is ₱50' }, { status: 400 });
    }
    if (!donorName || !donorEmail) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!referenceNumber || String(referenceNumber).length !== 13) {
      return NextResponse.json({ error: 'Reference number must be 13 digits' }, { status: 400 });
    }

    const donationData = {
      method: 'gcash',
      amount,
      currency: 'PHP',
      donorName,
      donorEmail,
      donorPhone,
      purpose: purpose || 'general',
      message: message || '',
      referenceNumber,
      screenshots,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const donationsRef = ref(database, 'donations');
    const newRef = push(donationsRef);
    await set(newRef, donationData);

    return NextResponse.json({ ok: true, id: newRef.key, donation: donationData });
  } catch (err: any) {
    console.error('API GCash donation error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

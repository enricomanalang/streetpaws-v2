import { NextRequest, NextResponse } from 'next/server';

const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY;
const MAYA_SECRET_KEY = process.env.MAYA_SECRET_KEY;
const MAYA_ENV = process.env.MAYA_ENV || 'sandbox';

const MAYA_BASE_URL = MAYA_ENV === 'production'
	? 'https://pg.maya.ph/checkout/v1'
	: 'https://pg-sandbox.maya.ph/checkout/v1';

export async function POST(req: NextRequest) {
	try {
		if (!MAYA_PUBLIC_KEY || !MAYA_SECRET_KEY) {
			return NextResponse.json({ error: 'Maya is not configured' }, { status: 503 });
		}

		const body = await req.json();
		const {
			amount,
			donorName,
			donorEmail,
			donorPhone,
			purpose,
			dedication,
			isAnonymous,
		} = body || {};

		if (!amount || amount < 50) {
			return NextResponse.json({ error: 'Minimum donation amount is ₱50' }, { status: 400 });
		}
		if (!donorName || !donorEmail) {
			return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
		}

		const checkoutRequest = {
			totalAmount: {
				amount: Number(amount),
				currency: 'PHP',
			},
			buyer: {
				firstName: donorName,
				contact: {
					email: donorEmail,
					phone: donorPhone || '',
				},
			},
			items: [
				{
					name: `Donation - ${purpose || 'general'}`,
					quantity: 1,
					amount: {
						value: Number(amount),
					},
				},
			],
			requestReferenceNumber: `don-${Date.now()}`,
			metadata: {
				purpose: purpose || 'general',
				dedication: dedication || '',
				isAnonymous: Boolean(isAnonymous),
			},
			redirectUrl: {
				success: `${req.nextUrl.origin}/donate?status=success`,
				failure: `${req.nextUrl.origin}/donate?status=failure`,
				cancel: `${req.nextUrl.origin}/donate?status=cancel`,
			},
		};

		const response = await fetch(`${MAYA_BASE_URL}/checkouts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${Buffer.from(`${MAYA_PUBLIC_KEY}:${MAYA_SECRET_KEY}`).toString('base64')}`,
			},
			body: JSON.stringify(checkoutRequest),
		});

		if (!response.ok) {
			const err = await response.text();
			return NextResponse.json({ error: 'Failed to create Maya checkout', details: err }, { status: 502 });
		}

		const data = await response.json();
		return NextResponse.json({ checkoutId: data.checkoutId, redirectUrl: data.redirectUrl });
	} catch (err: any) {
		console.error('Maya checkout error:', err);
		return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
	}
}

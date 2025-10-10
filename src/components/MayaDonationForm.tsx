'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MayaDonationFormProps {
	onSuccess?: (donation: any) => void;
}

export default function MayaDonationForm({ onSuccess }: MayaDonationFormProps) {
	const [formData, setFormData] = useState({
		amount: 0,
		customAmount: '',
		donorName: '',
		donorEmail: '',
		donorPhone: '',
		purpose: 'general',
		dedication: '',
		isAnonymous: false,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const getFinalAmount = () => (formData.customAmount ? parseFloat(formData.customAmount) : formData.amount);

	const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		const finalAmount = getFinalAmount();
		if (!finalAmount || finalAmount < 50) {
			setError('Minimum donation amount is ₱50');
			return;
		}
		if (!formData.donorName || !formData.donorEmail) {
			setError('Please fill in your name and email');
			return;
		}
		if (!isValidEmail(formData.donorEmail)) {
			setError('Please enter a valid email address');
			return;
		}

		try {
			setSubmitting(true);
			const res = await fetch('/api/donations/maya', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: Math.round(finalAmount),
					donorName: formData.donorName,
					donorEmail: formData.donorEmail,
					donorPhone: formData.donorPhone,
					purpose: formData.purpose,
					dedication: formData.dedication,
					isAnonymous: formData.isAnonymous,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || 'Checkout failed');
			}

			if (data?.redirectUrl) {
				window.location.href = data.redirectUrl;
				return;
			}

			setError('Unexpected response from payment gateway');
		} catch (err: any) {
			setError(err?.message || 'Failed to start checkout');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Donor Name</label>
					<Input value={formData.donorName} onChange={(e) => setFormData({ ...formData, donorName: e.target.value })} placeholder="Juan Dela Cruz" />
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Email</label>
					<Input type="email" value={formData.donorEmail} onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })} placeholder="you@example.com" />
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Phone (optional)</label>
					<Input value={formData.donorPhone} onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="09XXXXXXXXX" />
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Amount (₱)</label>
					<Input type="number" min={50} step={50} value={formData.customAmount} onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })} placeholder="500" />
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Purpose</label>
				<Input value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Dedication (optional)</label>
				<Textarea value={formData.dedication} onChange={(e) => setFormData({ ...formData, dedication: e.target.value })} />
			</div>
			<div className="flex items-center gap-2">
				<input id="anonymous" type="checkbox" checked={formData.isAnonymous} onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })} />
				<label htmlFor="anonymous" className="text-sm">Donate anonymously</label>
			</div>
			{error && <div className="text-red-600 text-sm">{error}</div>}
			<Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Redirecting…' : 'Proceed to Maya Checkout'}</Button>
		</form>
	);
}

'use client';

import { useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ImageUploader from '@/components/ImageUploader';

interface BankDepositDonationFormProps {
	bankName: string; // e.g., BPI / BDO
	accountName: string;
	accountNumberMasked: string; // show masked for UI
	onSuccess?: (donation: any) => void;
}

export default function BankDepositDonationForm({ bankName, accountName, accountNumberMasked, onSuccess }: BankDepositDonationFormProps) {
	const { user } = useAuth();
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const [formData, setFormData] = useState({
		amount: 0,
		customAmount: '',
		donorName: '',
		donorEmail: '',
		donorPhone: '',
		referenceNumber: '',
		purpose: 'general',
		message: '',
	});

	const getFinalAmount = () => (formData.customAmount ? parseFloat(formData.customAmount) : formData.amount);
	const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

	const handleInputChange = (field: string, value: any) => {
		if (field === 'donorPhone') {
			const digits = String(value).replace(/\D/g, '').slice(0, 11);
			setFormData(prev => ({ ...prev, donorPhone: digits }));
			setError('');
			return;
		}
		setFormData(prev => ({ ...prev, [field]: value }));
		setError('');
	};

	const handleAmountSelect = (amount: number) => {
		setFormData(prev => ({ ...prev, amount, customAmount: '' }));
	};

	const handleCustomAmountChange = (value: string) => {
		const amount = parseFloat(value) || 0;
		setFormData(prev => ({ ...prev, customAmount: value, amount }));
	};

	const handleReferenceChange = (value: string) => {
		const digitsOnly = value.replace(/\s/g, '').slice(0, 30);
		setFormData(prev => ({ ...prev, referenceNumber: digitsOnly }));
		setError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			setError('Please log in to submit a donation');
			return;
		}

		const finalAmount = getFinalAmount();
		if (finalAmount < 50) {
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
		if (!formData.referenceNumber) {
			setError('Please enter the bank reference number');
			return;
		}

		try {
			setError('');
			const donationData = {
				method: 'bank',
				bankName,
				amount: finalAmount,
				currency: 'PHP',
				donorName: formData.donorName,
				donorEmail: formData.donorEmail,
				donorPhone: formData.donorPhone,
				purpose: formData.purpose || 'general',
				message: formData.message || '',
				referenceNumber: formData.referenceNumber,
				screenshots: imageUrls,
				status: 'pending',
				createdAt: new Date().toISOString(),
				userId: user.uid,
			};

			const donationsRef = ref(database, 'donations');
			const docRef = await push(donationsRef, donationData);

			setSuccess(true);
			onSuccess?.({ ...donationData, id: docRef.key });
		} catch (err: any) {
			console.error('Bank donation submit error:', err);
			setError(err?.message || 'Failed to save donation');
		}
	};

	if (success) {
		return (
			<div className="text-center py-12">
				<h3 className="text-2xl font-bold text-green-700 mb-2">Thank you!</h3>
				<p className="text-gray-700">We received your submission. We'll confirm once we verify your deposit.</p>
			</div>
		);
	}

	return (
		<div>
			<Card className="p-4 mb-4 bg-blue-50 border border-blue-200">
				<p className="text-sm text-blue-800">
					Send via {bankName} to <span className="font-semibold">{accountName}</span> • <span className="font-mono">{accountNumberMasked}</span>
				</p>
			</Card>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">Donation Amount</label>
						<div className="grid grid-cols-5 gap-2 mb-2">
							{[100,200,300,500,1000].map(v => (
								<button key={v} type="button" className="border rounded px-3 py-2 text-sm" onClick={() => handleAmountSelect(v)}>₱{v.toLocaleString()}</button>
							))}
						</div>
						<Input placeholder="Custom amount" value={formData.customAmount} onChange={(e) => handleCustomAmountChange(e.target.value)} />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Reference Number</label>
						<Input value={formData.referenceNumber} onChange={(e) => handleReferenceChange(e.target.value)} placeholder="e.g., 123456789" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Donor Name</label>
						<Input value={formData.donorName} onChange={(e) => handleInputChange('donorName', e.target.value)} placeholder="Juan Dela Cruz" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Email</label>
						<Input type="email" value={formData.donorEmail} onChange={(e) => handleInputChange('donorEmail', e.target.value)} placeholder="you@example.com" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Phone (optional)</label>
						<Input value={formData.donorPhone} onChange={(e) => handleInputChange('donorPhone', e.target.value)} placeholder="09XXXXXXXXX" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Purpose</label>
						<Input value={formData.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} />
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Upload Proof (screenshot)</label>
					<ImageUploader folder="bank-receipts" max={3} onChange={setImageUrls} onUploadingChange={setUploading} />
				</div>

				{error && <div className="text-red-600 text-sm">{error}</div>}
				<Button type="submit" className="w-full">Submit Bank Deposit</Button>
			</form>
		</div>
	);
}

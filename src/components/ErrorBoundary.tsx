"use client";

import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: error?.message || 'Something went wrong.' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error('Donation ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto p-6 my-6 bg-red-50 border border-red-200 rounded-md text-red-800">
          <h3 className="font-semibold mb-2">We encountered a problem.</h3>
          <p className="text-sm">{this.state.message}</p>
          <p className="text-xs mt-2 text-red-700">Please try again or refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

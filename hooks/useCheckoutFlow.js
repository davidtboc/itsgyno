'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PENDING_ANALYSIS_KEY = 'pendingAnalysisPayload';

const convertToBase64 = (selectedFile) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(selectedFile);
  });

export default function useCheckoutFlow() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitAnalysis = async (sessionId, imageBase64, imageBase64Second) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          imageBase64Second,
          checkoutSessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Analysis failed. Please try again.');
      }

      const result = await response.json();
      const params = new URLSearchParams({
        verdict: result.verdict || '',
        explanation: result.explanation || '',
      });

      router.push(`/results?${params.toString()}`);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const runPostCheckoutAnalysis = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const sessionId = params.get('session_id');

      if (paymentStatus === 'cancel') {
        setError('Payment was canceled. Please try again.');
        router.replace('/');
        return;
      }

      if (paymentStatus !== 'success' || !sessionId) {
        return;
      }

      const pending = sessionStorage.getItem(PENDING_ANALYSIS_KEY);
      if (!pending) {
        setError('Missing uploaded image. Please upload again.');
        router.replace('/');
        return;
      }

      let parsedPending;
      try {
        parsedPending = JSON.parse(pending);
      } catch {
        setError('Unable to restore uploaded image. Please upload again.');
        sessionStorage.removeItem(PENDING_ANALYSIS_KEY);
        router.replace('/');
        return;
      }

      const { imageBase64, imageBase64Second } = parsedPending;
      if (!imageBase64) {
        setError('Missing uploaded image. Please upload again.');
        sessionStorage.removeItem(PENDING_ANALYSIS_KEY);
        router.replace('/');
        return;
      }

      sessionStorage.removeItem(PENDING_ANALYSIS_KEY);
      await submitAnalysis(sessionId, imageBase64, imageBase64Second || null);
    };

    runPostCheckoutAnalysis();
  }, [router]);

  const startCheckout = async ({ file, secondFile }) => {
    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const imageBase64 = await convertToBase64(file);
      const imageBase64Second = secondFile
        ? await convertToBase64(secondFile)
        : null;

      sessionStorage.setItem(
        PENDING_ANALYSIS_KEY,
        JSON.stringify({
          imageBase64,
          imageBase64Second,
        })
      );

      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout.');
      }
      if (!data.url) {
        throw new Error('Missing Stripe checkout URL.');
      }

      window.location.assign(data.url);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
      sessionStorage.removeItem(PENDING_ANALYSIS_KEY);
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    setError,
    startCheckout,
  };
}

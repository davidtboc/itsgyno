'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImageUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
    setError('');
  };

  const convertToBase64 = (selectedFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const imageBase64 = await convertToBase64(file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
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

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="image">Upload image</label>
      <input id="image" type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Submit'}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}

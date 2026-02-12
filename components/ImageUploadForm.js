'use client';

import { useState } from 'react';
import useCheckoutFlow from '../hooks/useCheckoutFlow';

export default function ImageUploadForm({ processingReturn = false }) {
  const [file, setFile] = useState(null);
  const [secondFile, setSecondFile] = useState(null);
  const { loading, error, setError, startCheckout } = useCheckoutFlow();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
    setError('');
  };

  const handleSecondFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setSecondFile(selectedFile || null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await startCheckout({ file, secondFile });
  };

  if (processingReturn) {
    return (
      <section className="primary-content">
        <h1>Finalizing Your Results</h1>
        <p>Payment confirmed. Running your analysis now...</p>
        {error ? <p className="error">{error}</p> : null}
      </section>
    );
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="image">Upload image</label>
      <input id="image" type="file" accept="image/*" onChange={handleFileChange} />
      <label htmlFor="image-second">Upload second image (optional)</label>
      <input
        id="image-second"
        type="file"
        accept="image/*"
        onChange={handleSecondFileChange}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}

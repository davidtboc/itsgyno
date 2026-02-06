export default function ResultsPage({ searchParams }) {
  const verdict = searchParams?.verdict || 'No verdict available.';
  const explanation = searchParams?.explanation || 'No explanation available.';

  return (
    <main className="container">
      <h1>Analysis Result</h1>
      <p className="verdict">{verdict}</p>
      <p>{explanation}</p>
    </main>
  );
}

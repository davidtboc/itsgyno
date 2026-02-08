import ImageUploadForm from '../components/ImageUploadForm';

export default function HomePage() {
  return (
    <main className="container">
      <div className="page-layout">
        <section className="primary-content">
          <h1>Gynecomastia Image Analysis</h1>
          <p>Upload a chest image and get a gynecomastia assessment.</p>
          <ImageUploadForm />
        </section>
        <aside className="sponsor-banner" aria-label="Sponsor banner">
          <p>Sponsored by board-certified surgeons in the US.</p>
        </aside>
      </div>
      <footer className="disclaimer">
        <p>
          This is not medical advice and does not substitute seeing a medical
          professional in person.
        </p>
      </footer>
    </main>
  );
}

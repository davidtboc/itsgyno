import ImageUploadForm from '../components/ImageUploadForm';

export default function HomePage() {
  return (
    <main className="container">
      <h1>Gynecomastia Image Analysis</h1>
      <p>Upload a chest image and get an AI-based gynecomastia assessment.</p>
      <ImageUploadForm />
    </main>
  );
}

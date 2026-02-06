import './globals.css';

export const metadata = {
  title: 'ItsGyno - Image Analysis',
  description: 'Analyze chest images for gynecomastia indicators.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

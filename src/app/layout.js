import './globals.css';

export const metadata = {
  title: 'E-waste Awareness Workshop Registration',
  description: 'Join the E-waste Awareness Workshop supported by ProSAR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}

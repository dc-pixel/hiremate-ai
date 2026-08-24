import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HireMate AI',
  description: 'AI-powered recruitment and interview platform',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'HireMate AI',
    template: '%s | HireMate AI',
  },
  description: 'AI-powered recruitment and interview platform for candidates and recruiters.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

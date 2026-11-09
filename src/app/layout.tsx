import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       { default: 'Game n Glam — Everything, well chosen.', template: '%s | Game n Glam' },
  description: 'Curated goods across every department, backed by real reviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

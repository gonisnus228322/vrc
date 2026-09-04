import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quick Vault',
  description: 'Simple temporary file transfer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

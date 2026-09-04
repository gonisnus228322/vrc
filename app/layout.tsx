import './globals.css';

export const metadata = {
  title: 'Quick Vault',
  description: 'Self-destructing temporary file vault',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

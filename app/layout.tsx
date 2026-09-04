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
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

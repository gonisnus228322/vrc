import './globals.css';

export const metadata = {
  title: 'Temp File Hub',
  description: 'Self-destructing file sharing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

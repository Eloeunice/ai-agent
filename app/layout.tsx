import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Task Generator - POC',
  description: 'Proof of concept for AI-powered task generation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0,
        backgroundColor: '#f8f9fa',
        color: '#212529',
      }}>
        {children}
      </body>
    </html>
  );
}


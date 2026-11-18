import type {Metadata} from 'next';
import './globals.css';
import { Shell } from '@/components/shell/shell';

export const metadata: Metadata = {
  title: 'Panda Portfolio | Ashish Kumar Panda',
  description: 'AI Engineer & MSCS Student Portfolio - Specializing in ML, Computer Vision, and Software Engineering.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Noto+Sans+Oriya:wght@400;600&family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

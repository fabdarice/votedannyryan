import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EF Executive Director Vote',
  description: 'Vote for Danny Ryan as Executive Director of the Ethereum Foundation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="bg-[#f0f7ff] min-h-screen">
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}

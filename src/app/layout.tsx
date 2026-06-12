import type {Metadata} from 'next';
import {Inter, JetBrains_Mono} from 'next/font/google';
import {cn} from '@/utils/cn';
import {siteConfig} from '../../site.config';
import './globals.css';

const sans = Inter({subsets: ['latin'], variable: '--font-sans-stack'});
const mono = JetBrains_Mono({subsets: ['latin'], variable: '--font-mono-stack'});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang={siteConfig.defaultLocale} data-theme="light">
      <body className={cn(sans.variable, mono.variable, 'font-sans antialiased')}>
        {children}
      </body>
    </html>
  );
}

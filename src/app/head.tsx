import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QRender',
  description: 'Generate and manage your QR codes with ease.',
  icons: {
    icon: [
      { url: '/QRender.png', type: 'image/png' },
    ],
    shortcut: { url: '/QRender.png', type: 'image/png' },
    apple: { url: '/QRender.png', type: 'image/png' },
  },
};

export default function Head() {
  return (
    <>
      <title>QRender</title>
      <meta name="description" content="Generate and manage your QR codes with ease." />
      <link rel="icon" href="/QRender.png" type="image/png" />
      <link rel="shortcut icon" href="/QRender.png" type="image/png" />
      <link rel="apple-touch-icon" href="/QRender.png" type="image/png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}

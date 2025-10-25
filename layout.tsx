import type { Metadata } from 'next'
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import FarcasterWrapper from '@/components/FarcasterWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
        title: "BASE Station Audio Player",
        description: "Stream Audius content with tipping and NFT features. Enjoy a 5-band graphic EQ and a dynamic fire-pattern spectrum analyzer for an enhanced listening experience.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_a378aed8-c724-4ddb-93ae-99c8bd084919-nPdZMCXDMPUNsIhcZss5BmrE5j8JTq","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"BASE Station Audio Player","url":"https://sick-base-432.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };

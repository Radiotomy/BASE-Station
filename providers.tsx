'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey="EUK6nliWVdB5Nkt4VuNXUsAV7VwBmtwR"
      projectId="1d0226d4-9f84-48d6-9486-b4381e220d9f"
      chain={base}
      config={{
        appearance: {
          name: 'BASE Station',
          logo: 'https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/a378aed8-c724-4ddb-93ae-99c8bd084919_cmgh9r6xn0fg70bpg6ij1dlqf-nC18flSM3Amz9F2TMbMXFi07yEeBqv.jpg?download=1',
          mode: 'dark',
          theme: 'default',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}

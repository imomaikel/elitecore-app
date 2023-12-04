'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, ReactNode } from 'react';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/trpc';

export function TRPCProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            credentials: 'include',
                        });
                    },
                }),
            ],
        }),
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}

// https://trpc.io/docs/client/react/setup

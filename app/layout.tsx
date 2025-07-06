'use client'
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { APIProvider } from "@vis.gl/react-google-maps";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
// export const metadata: Metadata = {
//   title: "Modern SaaS Platform - Build, Scale, Succeed",
//   description:
//     "Comprehensive SaaS platform with authentication, payments, and analytics. Built with modern technology for reliability and performance.",
//   openGraph: {
//     title: "Modern SaaS Platform",
//     description:
//       "Comprehensive SaaS platform with authentication, payments, and analytics. Built with modern technology for reliability and performance.",
//     url: "saas-platform.com",
//     siteName: "SaaS Platform",
//     images: [
//       {
//         url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
//         width: 1200,
//         height: 630,
//         alt: "Modern SaaS Platform",
//       },
//     ],
//     locale: "en-US",
//     type: "website",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,    // 5 minutes
        gcTime: 30 * 60 * 1000,      // 30 minutes  
        retry: 1,                     // Single retry on failure
        refetchOnWindowFocus: false,  // Don't refetch on tab switch
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`} suppressHydrationWarning={true}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            forcedTheme="light"
            disableTransitionOnChange
          >
            <APIProvider apiKey={apiKey}>
              {children}
              <Toaster />
              <Analytics />
              <ReactQueryDevtools initialIsOpen={false} />
            </APIProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

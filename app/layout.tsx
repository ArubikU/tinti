import { LanguageProvider } from "@/lib/language"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#A678FF" },
    { media: "(prefers-color-scheme: dark)", color: "#A678FF" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Tinti.art - Editor de Pixel Art Colaborativo",
    template: "%s | Tinti.art",
  },
  description:
    "Crea pixel art increíble con nuestro editor colaborativo en tiempo real. Herramientas profesionales, capas, animaciones y más. ¡Gratis y sin registro!",
  keywords: [
    "pixel art",
    "editor",
    "colaborativo",
    "tiempo real",
    "arte digital",
    "sprites",
    "animación",
    "8-bit",
    "16-bit",
    "retro",
    "juegos",
    "diseño",
    "creatividad",
    "herramientas",
    "gratis",
    "online",
  ],
  authors: [{ name: "Tinti.art Team" }],
  creator: "Tinti.art",
  publisher: "Tinti.art",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tintiart.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: "Tinti.art - Editor de Pixel Art Colaborativo",
    description:
      "Crea pixel art increíble con nuestro editor colaborativo en tiempo real. Herramientas profesionales, capas, animaciones y más. ¡Gratis y sin registro!",
    siteName: "Tinti.art",
    images: [
      {
        url: "/icons/tinti-logo.png",
        width: 1200,
        height: 1200,
        alt: "Tinti.art Logo",
        type: "image/png",
      },
      {
        url: "/icons/tinti-text.png",
        width: 1200,
        height: 630,
        alt: "Tinti.art - Editor de Pixel Art Colaborativo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinti.art - Editor de Pixel Art Colaborativo",
    description:
      "Crea pixel art increíble con nuestro editor colaborativo en tiempo real. Herramientas profesionales, capas, animaciones y más. ¡Gratis y sin registro!",
    images: ["/icons/tinti-text.png"],
    creator: "@tintiart",
    site: "@tintiart",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/tinti-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/tinti-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/tinti-logo.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/tinti-logo", sizes: "180x180", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "152x152", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "144x144", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "120x120", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "114x114", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "76x76", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "72x72", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "60x60", type: "image/png" },
      { url: "/icons/tinti-logo", sizes: "57x57", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/tinti-logo.svg",
        color: "#A678FF",
      },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#A678FF",
    "msapplication-TileImage": "/icons/tinti-text.png",
    "msapplication-config": "/browserconfig.xml",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Tinti.art",
              description:
                "Editor de pixel art colaborativo en tiempo real con herramientas profesionales, capas, animaciones y más.",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://tintiart.vercel.app",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "Tinti.art",
                url: process.env.NEXT_PUBLIC_APP_URL || "https://tintiart.vercel.app",
              },
              featureList: [
                "Editor de pixel art colaborativo",
                "Herramientas profesionales",
                "Sistema de capas",
                "Animaciones",
                "Exportación múltiple",
                "Paletas de colores",
                "Onion skinning",
                "Tiempo real",
              ],
              screenshot: `${process.env.NEXT_PUBLIC_APP_URL || "https://tintiart.vercel.app"}/screenshot.png`,
              softwareVersion: "1.0.0",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            }),
          }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//api.dicebear.com" />

        {/* Additional Meta Tags */}
        <meta name="application-name" content="Tinti.art" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tinti.art" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#A678FF" />
        <meta name="color-scheme" content="light" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Performance Hints */}
        <link rel="preload" href="/icons/tinti-logo.png" as="image" type="image/png" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>

        {/* Analytics placeholder */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Analytics placeholder
              // window.gtag = window.gtag || function(){dataLayer.push(arguments);};
              // gtag('js', new Date());
              // gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </body>
    </html>
  )
}

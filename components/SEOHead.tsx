"use client"

import Head from "next/head"

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article" | "profile" | "embed"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

export function SEOHead({
  title = "Tinti.art - Editor de Pixel Art Colaborativo",
  description = "Crea pixel art increíble con nuestro editor colaborativo en tiempo real. Herramientas profesionales, capas, animaciones y más. ¡Gratis y sin registro!",
  image = "/og-image.png",
  url = "/",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  tags = [],
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tintiart.vercel.app"
  const fullUrl = `${baseUrl}${url}`
  const fullImageUrl = image.startsWith("http") || image.startsWith("data:") ? image : `${baseUrl}${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Tinti.art" />
      <meta property="og:locale" content="es_ES" />

      {/* Article specific */}
      {type === "article" && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === "article" && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === "article" && author && <meta property="article:author" content={author} />}
      {type === "article" && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@tintiart" />
      <meta name="twitter:site" content="@tintiart" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <meta name="bingbot" content="index,follow" />

      {/* Schema.org for specific pages */}
      {type === "article" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: title,
              description: description,
              image: fullImageUrl,
              url: fullUrl,
              datePublished: publishedTime,
              dateModified: modifiedTime || publishedTime,
              author: {
                "@type": "Person",
                name: author || "Tinti.art Team",
              },
              publisher: {
                "@type": "Organization",
                name: "Tinti.art",
                logo: {
                  "@type": "ImageObject",
                  url: `${baseUrl}/icons/tinti-logo.png`,
                },
              },
              keywords: tags.join(", "),
            }),
          }}
        />
      )}
    </Head>
  )
}

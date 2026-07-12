import 'css/tailwind.css'
import 'pliny/search/algolia.css'

import { Space_Grotesk } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider } from '@/components/search/SearchProvider'
import Header from '@/components/navigation/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/navigation/Footer'
import siteMetadata from '@/data/siteMetadata'
import { maintitle, maindescription } from '@/data/localeMetadata'
import { ThemeProvider } from '@/components/theme/ThemeContext'
import { LocaleProvider } from '@/components/locale/LocaleProvider'
import CustomCursor from '@/components/ui/CustomCursor'
import PageTransition from '@/components/animations/PageTransition'
import JsonLd from '@/components/seo/JsonLd'
import { Metadata, Viewport } from 'next'
import { dir } from 'i18next'
import { LocaleTypes, locales } from './i18n/settings'
import TwSizeIndicator from '@/components/helper/TwSizeIndicator'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#000' },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocaleTypes }>
}): Promise<Metadata> {
  const locale = (await params).locale

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: maintitle[locale],
      template: `%s | ${maintitle[locale]}`,
    },
    description: maindescription[locale],
    openGraph: {
      title: maintitle[locale],
      description: maindescription[locale],
      url: './',
      siteName: maintitle[locale],
      images: [siteMetadata.socialBanner],
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: './',
      languages: {
        en: `${siteMetadata.siteUrl}/`,
        pt: `${siteMetadata.siteUrl}/pt`,
      },
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
      },
    },
    icons: {
      icon: [
        { url: '/static/favicons/favicon.ico' },
        { url: '/static/favicons/favicon.png', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/static/favicons/safari-pinned-tab.svg', color: '#16a34a' },
      ],
    },
    manifest: '/static/favicons/site.webmanifest',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    twitter: {
      title: maintitle[locale],
      description: maindescription[locale],
      site: siteMetadata.siteUrl,
      creator: siteMetadata.author,
      card: 'summary_large_image',
      images: [siteMetadata.socialBanner],
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: LocaleTypes }>
}) {
  const locale = (await params).locale

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-900 dark:text-white">
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <CustomCursor />
            <JsonLd type="website" locale={locale} />
            <JsonLd type="person" locale={locale} />
            <SectionContainer>
              <div className="flex h-screen flex-col justify-between font-sans">
                <SearchProvider>
                  <Header />
                  <main className="mb-auto">
                    <PageTransition>{children}</PageTransition>
                  </main>
                </SearchProvider>
                <Footer />
              </div>
            </SectionContainer>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}

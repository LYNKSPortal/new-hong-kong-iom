import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

const OG_IMAGE = DEFAULT_OG_IMAGE;

export const metadata: Metadata = {
  title: { default: "New Hong Kong | Asian Food Bar, Douglas", template: "%s | New Hong Kong" },
  description: "Authentic Chinese and Asian cuisine in Douglas, Isle of Man. Dine in or takeaway at New Hong Kong, 35 Castle Street — book your table online.",
  keywords: ["Chinese restaurant Douglas", "Asian food bar Isle of Man", "New Hong Kong Douglas", "takeaway Douglas Isle of Man", "Chinese restaurant Isle of Man"],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "New Hong Kong",
    title: "New Hong Kong | Asian Food Bar, Douglas",
    description: "Authentic Chinese and Asian cuisine in Douglas, Isle of Man. Dine in or takeaway at New Hong Kong, 35 Castle Street.",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: "New Hong Kong | Asian Food Bar, Douglas", description: "Authentic Chinese and Asian cuisine in Douglas, Isle of Man.", images: [OG_IMAGE.url] },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: "/favicon/favicon.ico" }, { url: "/favicon/favicon.svg", type: "image/svg+xml" }, { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" }], apple: [{ url: "/favicon/apple-touch-icon.png" }] },
  manifest: "/favicon/site.webmanifest",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: "New Hong Kong",
  alternateName: "New Hong Kong Asian Food Bar",
  description: "Asian Food Bar in Douglas, Isle of Man, serving authentic Chinese and Asian cuisine for dine-in and takeaway.",
  url: SITE_URL,
  telephone: "+44 1624 621059",
  image: `${SITE_URL}/outside-the-restaurant.jpg`,
  address: { "@type": "PostalAddress", streetAddress: "35 Castle Street", addressLocality: "Douglas", addressRegion: "Isle of Man", postalCode: "IM1 2HA", addressCountry: "IM" },
  servesCuisine: ["Chinese", "Asian"],
  priceRange: "££",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "12:00", closes: "22:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "12:00", closes: "23:00" },
  ],
  menu: `${SITE_URL}/menus`,
  acceptsReservations: "True",
  sameAs: [
    "https://www.facebook.com/NHKasianfoodbar/",
    "http://tripadvisor.com/UserReviewEdit-g190928-d8836192-New_Hong_Kong_Asian_Food_Bar-Douglas_Isle_of_Man.html",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${inter.variable} ${oswald.variable}`}><body className="font-sans antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><SiteChrome>{children}</SiteChrome></body></html>; }

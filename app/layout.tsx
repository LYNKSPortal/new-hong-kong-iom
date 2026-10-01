import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

export const metadata: Metadata = { title: { default: "New Hong Kong | Asian Food Bar, Douglas", template: "%s | New Hong Kong" }, description: "Authentic Asian flavours and warm hospitality in the heart of Douglas, Isle of Man.", metadataBase: new URL("https://newhongkong.im"), openGraph: { type: "website", locale: "en_GB", siteName: "New Hong Kong", title: "New Hong Kong | Asian Food Bar, Douglas", description: "Authentic Asian flavours in the heart of Douglas." }, twitter: { card: "summary_large_image" } };

const structuredData = { "@context": "https://schema.org", "@type": "Restaurant", name: "New Hong Kong", description: "Asian Food Bar in Douglas, Isle of Man", telephone: "+44 1624 621059", address: { "@type": "PostalAddress", streetAddress: "35 Castle Street", addressLocality: "Douglas", addressRegion: "Isle of Man", postalCode: "IM1 2HA", addressCountry: "IM" }, servesCuisine: ["Chinese", "Asian"], priceRange: "££", openingHours: ["Mo-Th 12:00-22:30", "Fr-Sa 12:00-23:00"] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${inter.variable} ${oswald.variable}`}><body className="font-sans antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><SiteChrome>{children}</SiteChrome></body></html>; }

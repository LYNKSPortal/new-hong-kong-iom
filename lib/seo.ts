import type { Metadata } from "next";

export const SITE_URL = "https://www.newhongkong.co.im";

export const DEFAULT_OG_IMAGE = {
  url: "/outside-the-restaurant.jpg",
  width: 1920,
  height: 1080,
  alt: "Outside the New Hong Kong restaurant on Castle Street, Douglas",
};

/**
 * Builds per-page metadata that includes the shared OG image by default.
 * Next.js replaces (rather than merges) the `openGraph`/`twitter` objects
 * between a layout and a page, so every page must redeclare `images`
 * itself or it silently loses the social preview image.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: typeof DEFAULT_OG_IMAGE;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitki Bakım Takipçisi",
  description: "Bitkilerinin sulama takvimini takip et.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${fraunces.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sky-top font-sans text-foreground">
        {/*
          THESIS: Not a dashboard of cards — the page is a garden bed itself,
          plants growing from soil in the order you planted them.
          OWN-WORLD: Pale cream sky over banded terracotta-and-umber soil,
          geometric stem-and-leaf marks, Fraunces display over Nunito Sans
          body, elevated warm "plant-tag" cards with soft offset shadows.
          STORY: The visitor sees their collection as a living row of growth;
          tapping bare soil plants a seed that becomes a seedling on the spot
          they touched.
          FIRST VIEWPORT: Floating pill nav overhead; below it, a pale-sky
          band then a soil bed holding a horizontal row of plants sized
          oldest-tallest to newest-shortest, ending in an open seed mound.
          FORM: User-pinned garden-bed metaphor; no concept roll run, the
          brief already committed the direction.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, DESIGN.md, and every shipping
          raster carrying its provenance.
        */}
        {children}
      </body>
    </html>
  );
}

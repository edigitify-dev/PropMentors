import type { Metadata } from "next";
import "./globals.css";
import { ContactProvider } from "@/components/contact-provider";
import { getContactDetails } from "@/lib/project-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PropMentors | Find the right space",
  description: "Find managed spaces that fit your business, your team and the way you work — with PropMentors by your side.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        {/* Keep the supplied bootstrap in the initial head, before hydration. */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMNKBVDW');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMNKBVDW"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ContactProvider details={await getContactDetails()}>{children}</ContactProvider>
      </body>
    </html>
  );
}

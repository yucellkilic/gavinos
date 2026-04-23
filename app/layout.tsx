import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GAVINO'S PIZZA - Premium Italian Catering",
  description: "Where Entertaining is an Art. Experience premium Italian-inspired catering with artisan craftsmanship for your special events.",
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="root-content">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

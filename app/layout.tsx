import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import MobileCartBar from "@/components/MobileCartBar";

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div id="root-content">
            <Header />
            <main>{children}</main>
            <MobileCartBar />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

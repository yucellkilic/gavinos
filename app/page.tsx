import Link from "next/link";
import { ArrowRight, Clock, Users, Truck, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ezGreen to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        <div className="ez-container py-20 lg:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Star size={14} className="text-yellow-300" />
              <span>Premium Italian Catering</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              <span>Catering made </span>
              <span className="text-yellow-300">simple</span>
              <span> for every occasion</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              <span>From intimate gatherings to grand celebrations, order premium Italian catering with just a few clicks.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/menu"
                className="ez-btn ez-btn-lg bg-white text-ezGreen font-bold hover:bg-gray-50 shadow-lg"
              >
                <span>Order Now</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="ez-btn ez-btn-lg border-2 border-white/30 text-white hover:bg-white/10"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="ez-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-ezGreen-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-ezGreen" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                <span>Easy Ordering</span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                <span>Browse our menu, customize your order, and schedule delivery in minutes.</span>
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-ezGreen-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-ezGreen" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                <span>Any Group Size</span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                <span>From 10 to 500+ guests, we scale our menu to fit your event perfectly.</span>
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-ezGreen-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck size={24} className="text-ezGreen" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                <span>Reliable Delivery</span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                <span>On-time delivery with setup included. Your event, our responsibility.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f7f7f7]">
        <div className="ez-container text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <span>Ready to order?</span>
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            <span>Browse our full menu and start building your perfect catering order today.</span>
          </p>
          <Link
            href="/menu"
            className="ez-btn ez-btn-primary ez-btn-lg"
          >
            <span>Explore Menu</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

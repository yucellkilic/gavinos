import Hero from "@/components/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Hero />
      
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-forestGreen mb-6 font-poppins">
            Artisan Italian Catering
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            From intimate gatherings to grand celebrations, our premium catering service 
            brings the authentic taste of Italy to your table. Every dish is crafted with 
            passion, precision, and the finest ingredients.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">🍕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Only the finest ingredients, sourced with care and prepared with expertise.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Master Craftsmanship</h3>
              <p className="text-gray-600">
                Every dish is a work of art, created by skilled culinary artisans.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Perfect Events</h3>
              <p className="text-gray-600">
                From corporate events to weddings, we make every occasion memorable.
              </p>
            </div>
          </div>
          
          <Link
            href="/menu"
            className="inline-block px-8 py-4 bg-forestGreen text-white font-semibold rounded-lg hover:bg-forestGreen/90 transition-smooth shadow-lg hover:shadow-xl"
          >
            Explore Our Menu
          </Link>
        </div>
      </section>
    </div>
  );
}

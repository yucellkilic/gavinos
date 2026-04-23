# GAVINO'S PIZZA - Premium Italian Catering Platform

A modern, premium Italian-inspired catering and food ordering SaaS platform built with Next.js 14, featuring dynamic pricing, real-time cart management, and multiple payment gateway integrations.

## 🎨 Design Philosophy

- **Italian Retro-Premium Aesthetic**: Forest Green (#1f5f3a), Classic Red (#c62828), Pure White (#ffffff)
- **Paper Grain Texture**: Subtle background texture for premium feel
- **Master Craftsmanship**: Avoiding cheap or neon design elements
- **Mobile-First**: Optimized for 3-click ordering on mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **Payments**: Stripe (Square, Apple Pay, Google Pay ready)

## 📦 Features

### Core Features
- ✅ Responsive navigation with sticky header
- ✅ Hero section with brand motto
- ✅ Menu filtering by meal type (Breakfast, Lunch, Dinner)
- ✅ Dynamic pricing calculator (Price × People × Quantity)
- ✅ Required and optional option selection
- ✅ Shopping cart with persistent state
- ✅ Stripe payment integration
- ✅ Mobile-optimized checkout flow
- ✅ SEO optimization with dynamic metadata

### Menu System
- 12 premium menu items from "Butlered Hot Hors d'Oeuvres"
- Real-time price calculations
- Badge system for "Most Ordered" items
- High-quality imagery with lazy loading

### Payment Gateways
- ✅ Stripe (fully integrated)
- 🔄 Square (API routes ready)
- 🔄 Apple Pay (placeholder)
- 🔄 Google Pay (placeholder)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Stripe account (for payment processing)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Stripe keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
gavinos-catering/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   └── stripe/          # Stripe payment endpoints
│   ├── menu/                # Menu listing and detail pages
│   ├── cart/                # Shopping cart page
│   ├── checkout/            # Checkout page
│   └── order-confirmation/  # Order success page
├── components/              # React components
│   ├── Header.tsx          # Sticky navigation
│   ├── Hero.tsx            # Hero section
│   ├── MenuCard.tsx        # Menu item card
│   ├── MenuFilter.tsx      # Meal type filter
│   ├── RequiredOptions.tsx # Required selection engine
│   ├── OptionalOptions.tsx # Optional add-ons
│   ├── CartDrawer.tsx      # Sliding cart panel
│   └── StripePaymentForm.tsx # Stripe payment form
├── stores/                  # Zustand state management
│   ├── cartStore.ts        # Cart state with persistence
│   └── userStore.ts        # User session state
├── hooks/                   # Custom React hooks
│   └── usePriceCalculator.ts # Dynamic pricing logic
├── lib/                     # Utility functions
│   └── priceCalculator.ts  # Price calculation logic
├── types/                   # TypeScript type definitions
│   ├── menu.ts             # Menu item types
│   ├── cart.ts             # Cart types
│   └── payment.ts          # Payment types
└── data/                    # Static data
    └── menu.json           # Menu items database
```

## 🎯 Key Features Implementation

### Dynamic Pricing Calculator
Formula: `(Base Price + Optional Options) × Number of People × Quantity`

```typescript
const calculation = calculatePrice(
  basePrice,
  numberOfPeople,
  quantity,
  selectedOptionalOptions
);
```

### Selection Engine
- **Required Options**: Radio button groups (must select before adding to cart)
- **Optional Options**: Checkboxes (can select multiple)
- Real-time price updates as selections change

### Cart Management
- Persistent state using Zustand + localStorage
- Add, remove, update quantity
- Maintains configuration across page navigation

### Payment Flow
1. User completes order configuration
2. Adds items to cart
3. Proceeds to checkout
4. Selects payment method (Stripe)
5. Completes payment
6. Receives order confirmation

## 🎨 Design System

### Colors
- **Forest Green**: `#1f5f3a` (Primary brand color)
- **Classic Red**: `#c62828` (Accent color)
- **Pure White**: `#ffffff` (Background)

### Typography
- **Font Family**: Poppins (bold, retro style)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

### Animations
- **Duration**: 0.2s - 0.3s
- **Easing**: ease-in-out
- **Library**: Framer Motion

## 📱 Responsive Design

- **Mobile**: < 768px (single column, touch-optimized)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

## 🔒 Security

- Server-side price verification before payment
- Secure payment token handling
- No sensitive data in client-side code
- Environment variables for API keys

## 🚀 Performance

- Next.js 14 App Router for optimal performance
- Image optimization with next/image
- Code splitting and lazy loading
- Lighthouse score target: 90+

## 📝 Adding Menu Items

Edit `data/menu.json`:

```json
{
  "id": "unique-id",
  "name": "Item Name",
  "description": "Item description",
  "base_price": 5.50,
  "meal_type": ["breakfast", "lunch", "dinner"],
  "image_url": "/images/item.jpg",
  "badges": ["Most Ordered"],
  "optional_options": [
    {
      "id": "option-id",
      "label": "Option Label",
      "price": 0.50
    }
  ]
}
```

## 🎯 Future Enhancements

- [ ] Square payment integration
- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] User authentication
- [ ] Order history
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Delivery tracking

## 📄 License

This project is proprietary and confidential.

## 🤝 Support

For support, email support@gavinospizza.com

---

**Built with ❤️ using Next.js 14 and modern web technologies**

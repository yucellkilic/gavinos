import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Validate prices from Supabase
    const itemIds = items.map((item: any) => item.id);
    const { data: dbItems, error: dbError } = await supabase
      .from('menu_items')
      .select('id, base_price, name')
      .in('id', itemIds);

    if (dbError || !dbItems) {
      throw new Error('Could not verify item prices');
    }

    // 2. Calculate total
    let totalCents = 0;
    for (const cartItem of items) {
      const dbItem = dbItems.find((i) => i.id === cartItem.id);
      if (!dbItem) {
        throw new Error(`Item ${cartItem.name} not found in database`);
      }

      // Note: Pricing logic might be complex if there are options/accompaniments.
      // For this migration, we'll validate the base_price.
      // If base_price is null (custom pricing), we might handle it differently.
      
      const itemBasePrice = dbItem.base_price || 0;
      const quantity = cartItem.quantity || 1;
      const numPeople = cartItem.numberOfPeople || 1;

      // Simple calculation: base_price * people * quantity
      // (This should match the frontend logic)
      totalCents += Math.round(itemBasePrice * numPeople * quantity * 100);
    }

    if (totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // 3. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        item_count: items.length,
        // Store item IDs in metadata for reference
        items: JSON.stringify(items.map(i => i.id).slice(0, 10)) 
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}

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

    // 1. Validate base prices from Supabase
    const menuItemIds = items
      .map((item: any) => item?.menuItemId)
      .filter(Boolean);

    const { data: dbItems, error: dbError } = await supabase
      .from('menu_items')
      .select('id, item_price, item_name')
      .in('id', menuItemIds);

    if (dbError || !dbItems) {
      throw new Error('Could not verify item prices');
    }

    // 2. Calculate total including modifiers
    let totalCents = 0;
    const orderLineItems: any[] = [];

    for (const cartItem of items) {
      const dbItem = dbItems.find((i: any) => i?.id === cartItem?.menuItemId);
      
      // Base price from DB (trusted source)
      const itemBasePrice = Number(dbItem?.item_price) || 0;
      const quantity = Number(cartItem?.quantity) || 1;
      const numPeople = Number(cartItem?.numberOfPeople) || 1;

      // Sum modifier prices (these are additional charges)
      const modifiers = Array.isArray(cartItem?.selected_modifiers) ? cartItem.selected_modifiers : [];
      const modifiersTotal = modifiers.reduce(
        (sum: number, m: any) => sum + (Number(m?.price) || 0), 0
      );

      // Sum legacy accompaniments if any
      const accompaniments = Array.isArray(cartItem?.configuration?.selectedAccompaniments) 
        ? cartItem.configuration.selectedAccompaniments 
        : [];
      const accompTotal = accompaniments.reduce(
        (sum: number, a: any) => sum + (Number(a?.price) || 0), 0
      );

      const unitTotal = itemBasePrice + modifiersTotal + accompTotal;
      const lineTotal = unitTotal * numPeople * quantity;
      totalCents += Math.round(lineTotal * 100);

      orderLineItems.push({
        name: cartItem?.name || dbItem?.item_name || 'Item',
        base_price: itemBasePrice,
        modifiers_total: modifiersTotal,
        quantity,
        people: numPeople,
        line_total: lineTotal,
        selected_modifiers: modifiers,
      });
    }

    if (totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // 3. Create Stripe Payment Intent with full metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        item_count: String(items.length),
        // Full order details as JSON (Stripe allows up to 500 chars per key)
        order_summary: JSON.stringify(
          orderLineItems.map(li => ({
            n: li.name,
            bp: li.base_price,
            mt: li.modifiers_total,
            q: li.quantity,
            p: li.people,
            lt: li.line_total,
          }))
        ).slice(0, 500),
        // Store modifier selections separately for easy reference
        modifiers_detail: JSON.stringify(
          orderLineItems.flatMap(li => 
            (li.selected_modifiers || []).map((m: any) => ({
              item: li.name,
              mod: m?.modifier_name || '',
              grp: m?.group_name || '',
              price: m?.price || 0,
            }))
          )
        ).slice(0, 500),
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}

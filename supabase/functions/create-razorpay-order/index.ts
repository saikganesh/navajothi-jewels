import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderData, cartItems } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    // Create Razorpay order
    const razorpayOrder = {
      amount: Math.round(orderData.total_amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email
      }
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
      },
      body: JSON.stringify(razorpayOrder)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Razorpay API error:', errorData)
      throw new Error('Failed to create Razorpay order')
    }

    const razorpayOrderData = await response.json()

    // Store order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        order_items: cartItems,
        status: 'pending',
        payment_status: 'pending',
        razorpay_order_id: razorpayOrderData.id,
        shipping_address: orderData.shipping_address
      })
      .select()
      .single()

    if (orderError) {
      console.error('Database error:', orderError)
      throw new Error('Failed to create order in database')
    }

    console.log('Order created successfully:', order.id)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        razorpayOrderId: razorpayOrderData.id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-razorpay-order:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
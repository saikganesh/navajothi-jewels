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
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id,
      payment_method 
    } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Razorpay credentials
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured')
    }

    // Verify payment signature using Web Crypto API
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const encoder = new TextEncoder()
    const keyData = encoder.encode(razorpayKeySecret)
    const messageData = encoder.encode(body)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const isSignatureValid = expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      console.error('Invalid payment signature')
      throw new Error('Payment verification failed')
    }

    // Get the order details first
    const { data: orderData, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (orderFetchError || !orderData) {
      console.error('Failed to fetch order:', orderFetchError)
      throw new Error('Order not found')
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_payment_id: razorpay_payment_id,
        payment_method: payment_method,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update order:', updateError)
      throw new Error('Failed to update order status')
    }

    // Store payment details in payments table
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_signature: razorpay_signature,
        payment_method: payment_method,
        amount: orderData.total_amount,
        currency: 'INR',
        status: 'captured'
      })

    if (paymentError) {
      console.error('Failed to store payment details:', paymentError)
      // Don't throw error here as order update was successful
    }

    // Store order items in order_items table
    if (orderData.order_items && Array.isArray(orderData.order_items)) {
      const orderItemsToInsert = orderData.order_items.map((item: any) => ({
        order_id: order_id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        product_image: item.image || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) {
        console.error('Failed to store order items:', itemsError)
        // Don't throw error here as order update was successful
      }
    }

    console.log('Payment verified and order updated:', order_id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in verify-payment:', error)
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/crypto/crypto.ts"

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

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = await createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex")

    const isSignatureValid = expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      console.error('Invalid payment signature')
      throw new Error('Payment verification failed')
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
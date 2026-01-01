import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 300000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 20; // Max 20 verification attempts per 5 minutes per IP

// Input validation schema
const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
  order_id: z.string().uuid(),
  payment_method: z.string().min(1).max(50).optional(),
})

// Rate limiting helper function
async function checkRateLimit(supabase: any, clientIP: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `verify:${clientIP}`;
  const now = new Date();
  
  const { data: existingRecord, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('key', key)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Rate limit fetch error:', fetchError);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }

  if (!existingRecord) {
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        key: key,
        count: 1,
        last_reset: now.toISOString()
      });

    if (insertError) {
      console.error('Rate limit insert error:', insertError);
    }
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  const lastReset = new Date(existingRecord.last_reset);
  const timeSinceReset = now.getTime() - lastReset.getTime();

  if (timeSinceReset > RATE_LIMIT_WINDOW_MS) {
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        count: 1,
        last_reset: now.toISOString()
      })
      .eq('key', key);

    if (updateError) {
      console.error('Rate limit reset error:', updateError);
    }
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (existingRecord.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  const { error: incrementError } = await supabase
    .from('rate_limits')
    .update({
      count: existingRecord.count + 1
    })
    .eq('key', key);

  if (incrementError) {
    console.error('Rate limit increment error:', incrementError);
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existingRecord.count - 1 };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const rawBody = await req.json()
    
    // Validate input
    const validatedData = paymentVerificationSchema.parse(rawBody)
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id,
      payment_method 
    } = validatedData

    // Get user_id from authorization header if available
    const authHeader = req.headers.get('authorization')
    let userId = null
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      })
      
      const { data: { user } } = await tempClient.auth.getUser()
      if (user) {
        userId = user.id
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check rate limit
    const rateLimit = await checkRateLimit(supabase, clientIP);
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for payment verification, IP: ${clientIP}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many verification attempts. Please try again later.'
        }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString()
          },
          status: 429
        }
      );
    }

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
      console.error(`Invalid payment signature for order: ${order_id} (IP: ${clientIP})`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment verification failed. Please contact support if this persists.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
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

    // Store payment details in payments table with user_id if available
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
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

    console.log(`Payment verified and order updated: ${order_id} (IP: ${clientIP})`)

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
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: error.errors
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred during payment verification. Please contact support.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

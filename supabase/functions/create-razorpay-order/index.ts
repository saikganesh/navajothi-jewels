import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schemas
const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().trim().min(10).max(15),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Invalid pincode'),
})

const cartItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  price: z.number().positive().max(10000000),
  quantity: z.number().int().positive().max(1000),
  image: z.string().optional(),
  karat_selected: z.string().optional(),
})

const orderDataSchema = z.object({
  customer_name: z.string().trim().min(1).max(200),
  customer_email: z.string().email().max(255),
  customer_phone: z.string().trim().min(10).max(15),
  total_amount: z.number().positive().min(1).max(10000000),
  shipping_address: addressSchema,
})

const requestSchema = z.object({
  orderData: orderDataSchema,
  cartItems: z.array(cartItemSchema).min(1).max(100),
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json()
    
    // Validate input
    const validatedData = requestSchema.parse(rawBody)
    const { orderData, cartItems } = validatedData
    
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

    // Store order in database with user_id if available
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
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
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
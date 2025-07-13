import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const OrderFailed = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Payment failed';
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif text-destructive">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">
                    Unfortunately, your payment could not be processed.
                  </p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {error}
                  </p>
                </div>

                {orderId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Reference</label>
                    <p className="font-mono text-sm">{orderId}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-medium">What can you do?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• Check your payment method details</li>
                    <li>• Ensure sufficient balance in your account</li>
                    <li>• Try a different payment method</li>
                    <li>• Contact your bank if the issue persists</li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/checkout">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>Need help? Contact our support team</p>
                  <p>We're here to assist you with your order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderFailed;
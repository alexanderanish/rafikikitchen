'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import {QRCodeSVG} from 'qrcode.react';

// Define the Order type based on your MongoDB schema
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

function PaymentRequestContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'Unknown';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const UPI_ID = '9881153034@idfcfirst';
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Get orderId from the URL parameter
        const orderId = searchParams.get('orderId');
        console.log('Fetching order details for Order ID:', orderId);
        if (!orderId) {
          console.error('Order ID is missing');
          throw new Error('Order ID is missing');
        }

        // Updated endpoint path
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          console.error('Error fetching order details:', response.statusText);
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        console.log('Fetched order details:', data);
        setOrder(data.order);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Unable to load order details. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [searchParams]); // Fixed dependency array
  
  // Generate UPI URI for QR code
  const generateUpiUri = () => {
    const amount = order?.totalAmount.toString() || '0';
    return `upi://pay?pa=${UPI_ID}&pn=Rafiki%20Kitchen&am=${amount}&tr=${orderNumber}&tn=Order%20${orderNumber}`;
  };
  
  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(generateUpiUri());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw size={32} className="text-green-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : (
            <>
              {/* Rest of your component content */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Complete Your Payment</h1>
              </div>
              
              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                <h2 className="font-medium text-gray-800 mb-3">Order Summary</h2>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="text-gray-800 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">₹{order?.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mb-6">
                <h2 className="font-medium text-gray-800 mb-3">Payment Instructions:</h2>
                <ol className="text-gray-600 text-sm space-y-2 list-decimal pl-5">
                  <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>Scan the QR code below or use the UPI ID provided</li>
                  <li>Verify the payment amount: ₹{order?.totalAmount.toFixed(2)}</li>
                  <li>Complete the payment and wait for confirmation</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                {/* UPI ID Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <div className="flex items-center">
                    <div className="flex-grow bg-white border border-gray-300 rounded-l-md px-4 py-2 text-gray-700">
                      {UPI_ID}
                    </div>
                    <button 
                      onClick={handleCopyUPI}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-md flex items-center justify-center"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                
                {/* QR Code Section */}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Scan to pay</p>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 border border-gray-300 rounded-md inline-block">
                      <QRCodeSVG 
                        value={generateUpiUri()}
                        size={180}
                        level="H"
                        includeMargin={true}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyUpiLink}
                    className="mt-3 text-sm text-green-600 hover:text-green-800 flex items-center justify-center mx-auto"
                  >
                    <Copy size={14} className="mr-1" /> Copy UPI payment link
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/"
                  className="flex items-center justify-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Wrap the component that uses useSearchParams in a Suspense boundary
export default function PaymentRequest() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw size={32} className="text-green-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentRequestContent />
    </Suspense>
  );
}

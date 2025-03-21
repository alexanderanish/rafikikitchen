import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("rafiki_kitchen");

    // Fetch the order using the orderId
    const order = await db.collection("orders").findOne({ 
      _id: new ObjectId(orderId) 
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Format the order for the frontend
    const formattedOrder = {
      ...order,
      items: order.cart.map((item: any) => ({
        id: item.cartId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: order.cart.reduce(
        (total: number, item: any) => total + (item.price * item.quantity), 
        0
      ),
      customerName: order.checkoutInfo.name,
      customerEmail: order.checkoutInfo.email,
      customerPhone: order.checkoutInfo.phone,
      orderNumber: orderId
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching the order.' },
      { status: 500 }
    );
  }
}
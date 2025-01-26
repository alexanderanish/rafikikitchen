import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id; // Extract the dynamic ID from the route

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('rafiki_kitchen');

    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(orderId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'An error occurred while deleting the order.' }, { status: 500 });
  }
}

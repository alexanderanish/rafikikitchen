import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';


export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    const client = await clientPromise;
    const db = client.db('rafiki_kitchen');

    const updatedFields: Record<string, any> = {};
    if (status) updatedFields.status = status;
    if (paymentStatus) updatedFields.paymentStatus = paymentStatus;
    if (notes) updatedFields.notes = notes;

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updatedFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'An error occurred while updating the order.' }, { status: 500 });
  }
}

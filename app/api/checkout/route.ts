import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const { cart, checkoutInfo } = await request.json()

    const result = await db.collection("orders").insertOne({
      cart,
      checkoutInfo,
      createdAt: new Date(),
      status: 'todo'
    })

    const response = await fetch(`${process.env.VERCEL_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [process.env.EMAIL_ONE,process.env.EMAIL_TWO],
        replyTo:[process.env.EMAIL_ONE,process.env.EMAIL_TWO],
        checkoutInfo: checkoutInfo,
        cart: cart,
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('Email sent successfully:', data.messageId);
    } else {
      console.error('Error sending email:', data.error);
    }

    return NextResponse.json({ success: true, orderId: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'An error occurred while processing your order.' }, { status: 500 })
  }
}
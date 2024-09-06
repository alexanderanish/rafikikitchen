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

    return NextResponse.json({ success: true, orderId: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'An error occurred while processing your order.' }, { status: 500 })
  }
}
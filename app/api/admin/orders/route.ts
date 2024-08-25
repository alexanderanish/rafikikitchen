import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("rafiki_kitchen")

    const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ success: true, orders })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'An error occurred while fetching orders.' }, { status: 500 })
  }
}
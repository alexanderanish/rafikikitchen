import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}
const client = new MongoClient(uri)

export async function GET() {
  try {
    await client.connect()
    const database = client.db('rafiki_kitchen')
    const ordersCollection = database.collection('orders')

    const dates = await ordersCollection.distinct('checkoutInfo.date')
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort dates in descending order

    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
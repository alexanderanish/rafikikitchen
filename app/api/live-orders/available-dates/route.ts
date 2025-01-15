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
    // dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort dates in descending order
    dates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
    
      const dateA = new Date(yearA, monthA - 1, dayA); // JavaScript months are 0-indexed
      const dateB = new Date(yearB, monthB - 1, dayB);
    
      return dateA.getTime() - dateB.getTime(); 
    });
    console.log(dates, "dates")

    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
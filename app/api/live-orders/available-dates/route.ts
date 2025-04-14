import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// Make sure MONGODB_URI is defined
const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}

// Create a global MongoDB client that persists across requests
let client: MongoClient | null = null

async function getClient() {
  if (!client) {
    // We've already checked uri is not undefined above
    client = new MongoClient(uri as string)
    await client.connect()
  }
  return client
}

export async function GET() {
  try {
    const client = await getClient()
    const database = client.db('rafiki_kitchen')
    const ordersCollection = database.collection('orders')

    // Use a fresh query each time
    const dates = await ordersCollection.distinct('checkoutInfo.date')
    
    // Sort dates in ascending order (oldest to newest)
    dates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
    
      const dateA = new Date(yearA, monthA - 1, dayA); // JavaScript months are 0-indexed
      const dateB = new Date(yearB, monthB - 1, dayB);
    
      return dateA.getTime() - dateB.getTime(); 
    });

    // Set cache control headers to prevent caching
    return NextResponse.json({ dates }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
  // Don't close the client after each request - it's reused
}
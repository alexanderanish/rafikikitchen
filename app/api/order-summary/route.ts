import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}

const client = new MongoClient(uri)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
  }

  try {
    await client.connect()
    const database = client.db('rafiki-kitchen')
    const ordersCollection = database.collection('orders')

    const orders = await ordersCollection.aggregate([
      {
        $match: {
          'checkoutInfo.date': '30-06-2024'
        }
      },
      {
        $unwind: '$cart'
      },
      {
        $group: {
          _id: {
            timeSlot: '$checkoutInfo.time_slot',
            sandwichName: '$cart.name'
          },
          totalQuantity: {
            $sum: { $convert: { input: '$cart.quantity', to: 'int' } }
          }
        }
      },
      {
        $project: {
          timeSlot: '$_id.timeSlot',
          sandwichName: '$_id.sandwichName',
          totalQuantity: 1,
          _id: 0
        }
      },
      {
        $sort: {
          timeSlot: 1
        }
      }
    ]).toArray()
    console.log(orders,"orders")
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}


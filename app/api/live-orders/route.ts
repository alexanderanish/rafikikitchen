import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

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
    const database = client.db('rafiki_kitchen')
    const ordersCollection = database.collection('orders')
    
    const orders = await ordersCollection.find({ 'checkoutInfo.date': date }).toArray()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}

// export async function PUT(request: Request) {
//   const { orderId, status } = await request.json()

//   if (!orderId || !status) {
//     return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
//   }

//   try {
//     await client.connect()
//     const database = client.db('rafiki_kitchen')
//     const ordersCollection = database.collection('orders')

//     const result = await ordersCollection.updateOne(
//       { _id: new ObjectId(orderId) },
//       { 
//         $set: { status: status },
//         $push: { 
//           actions: {
//             type: 'STATUS_CHANGE',
//             from: 'PREVIOUS_STATUS', // You'd need to fetch the previous status before updating
//             to: status,
//             timestamp: new Date()
//           }
//         }
//       }
//     )

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'Order not found' }, { status: 404 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Database update error:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   } finally {
//     await client.close()
//   }
// }

// export async function POST(request: Request) {
//   const { orderId, actionType, actionDetails } = await request.json()

//   if (!orderId || !actionType) {
//     return NextResponse.json({ error: 'Order ID and action type are required' }, { status: 400 })
//   }

//   try {
//     await client.connect()
//     const database = client.db('rafiki-kitchen')
//     const ordersCollection = database.collection('orders')

//     const result = await ordersCollection.updateOne(
//       { _id: new ObjectId(orderId) },
//       { 
//         $push: { 
//           actions: {
//             type: actionType,
//             details: actionDetails,
//             timestamp: new Date()
//           }
//         }
//       }
//     )

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'Order not found' }, { status: 404 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Database update error:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   } finally {
//     await client.close()
//   }
// }
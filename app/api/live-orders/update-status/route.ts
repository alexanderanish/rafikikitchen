import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'



const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}

const client = new MongoClient(uri)

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    export async function POST(request: NextRequest) {
        try {
          const { orderId, newStatus } = await request.json()
      
          if (!orderId || !newStatus) {
            return NextResponse.json({ message: 'Missing orderId or newStatus' }, { status: 400 })
          }
      
          // Connect to MongoDB
          await client.connect()
          const database = client.db('rafiki_kitchen') // Replace with your actual database name
          const orders = database.collection('orders')
          const objectId = new ObjectId(orderId)
          console.log('orderId', orderId)
            console.log('newStatus', newStatus)
          // Update the order status
          const result = await orders.updateOne(
            { _id: objectId},
            {
              $set: { status: newStatus },
              $push: {
                actions: {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                },
              } as any, // Casting as any to resolve TypeScript linting issue
            }
          )
          console.log(result, "result")
          if (result.modifiedCount === 0) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 })
          }
      
          return NextResponse.json({ message: 'Order status updated successfully' }, { status: 200 })
        } catch (error) {
          console.error('Failed to update order status:', error)
          return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
        } finally {
          await client.close()
        }
      }
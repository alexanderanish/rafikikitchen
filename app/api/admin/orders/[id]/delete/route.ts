import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}

// Create a global MongoDB client that persists across requests
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri as string);
    await client.connect();
  }
  return client;
}

// In Next.js 15, route segment config is required to access params properly
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const params = await context.params;
    const id = params.id;
    
    const client = await getClient();
    const database = client.db('rafiki_kitchen');
    const ordersCollection = database.collection('orders');
    
    // Convert the ID parameter to MongoDB ObjectId
    const objectId = new ObjectId(id);
    
    // Delete the order document
    const result = await ordersCollection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' }
    );
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting order' }, 
      { status: 500 }
    );
  }
  // Don't close the client - it's reused
}

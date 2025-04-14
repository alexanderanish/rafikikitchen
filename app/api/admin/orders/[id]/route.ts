import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(
  request: NextRequest,
  props: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await props.params
    const { id } = params
    const { status } = await request.json()

    // Validate order ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Update order
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Fetch updated order
    const updatedOrder = await db.collection("orders").findOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
} 
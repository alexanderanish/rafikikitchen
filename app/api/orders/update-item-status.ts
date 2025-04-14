import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../../app/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  if (method !== "PUT") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  try {
    const { orderId, itemId, status } = req.body

    if (!orderId || !itemId || !status) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const collection = db.collection("orders")

    // Find the order and update the specific item's status
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(orderId),
        "items._id": new ObjectId(itemId)
      },
      { 
        $set: { "items.$.status": status }
      },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return res.status(404).json({ success: false, message: "Order or item not found" })
    }

    return res.status(200).json({ success: true, data: result.value })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}


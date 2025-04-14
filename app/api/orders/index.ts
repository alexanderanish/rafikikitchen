import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../../app/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const ordersCollection = db.collection("orders")
    const inventoryCollection = db.collection("inventory")

    switch (method) {
      case "GET":
        try {
          const orders = await ordersCollection.find({}).sort({ orderDate: -1 }).toArray()
          return res.status(200).json({ success: true, data: orders })
        } catch (error) {
          return res.status(400).json({ success: false })
        }
      case "POST":
        try {
          // Create the order
          const result = await ordersCollection.insertOne(req.body)

          // Update inventory for each item
          for (const item of req.body.items) {
            const inventoryResult = await inventoryCollection.findOneAndUpdate(
              { itemId: item.itemId },
              { $inc: { currentQuantity: -item.quantity } },
              { returnDocument: 'after' }
            )
            
            if (!inventoryResult || !inventoryResult.value) {
              return res.status(404).json({ success: false, message: "Inventory item not found" })
            }
          }

          return res.status(201).json({ success: true, data: { ...req.body, _id: result.insertedId } })
        } catch (error) {
          return res.status(400).json({ success: false })
        }
      default:
        return res.status(400).json({ success: false })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Database connection failed' })
  }
}


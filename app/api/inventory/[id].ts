import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../../app/lib/mongodb"
import { ObjectId, WithId, Document } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  try {
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const collection = db.collection("inventory")

    switch (method) {
      case "GET":
        try {
          const inventory = await collection.findOne({ _id: new ObjectId(id as string) })
          if (!inventory) {
            return res.status(404).json({ success: false })
          }
          return res.status(200).json({ success: true, data: inventory })
        } catch (error) {
          return res.status(400).json({ success: false })
        }
      case "PUT":
        try {
          const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id as string) },
            { $set: req.body },
            { returnDocument: 'after' }
          )
          
          if (!result || !result.value) {
            return res.status(404).json({ success: false })
          }
          
          return res.status(200).json({ success: true, data: result.value })
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


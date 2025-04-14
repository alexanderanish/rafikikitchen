import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../../app/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const collection = db.collection("inventory")

    switch (method) {
      case "GET":
        try {
          const inventory = await collection.find({}).toArray()
          return res.status(200).json({ success: true, data: inventory })
        } catch (error) {
          return res.status(400).json({ success: false })
        }
      case "POST":
        try {
          const inventory = await collection.insertOne(req.body)
          return res.status(201).json({ success: true, data: inventory })
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


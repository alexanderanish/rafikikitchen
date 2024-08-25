import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")

    const admin = await db.collection("admins").findOne({ username })

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    return NextResponse.json({ success: true, token })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'An error occurred during login.' }, { status: 500 })
  }
}
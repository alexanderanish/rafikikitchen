const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdmin() {
  try {
    await client.connect();
    const db = client.db("rafiki_kitchen");
    const adminsCollection = db.collection("admins");

    const username = "anisha";
    const password = "anish@123";

    const existingAdmin = await adminsCollection.findOne({ username });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminsCollection.insertOne({
      username,
      password: hashedPassword,
    });

    console.log("Admin user created successfully");
  } finally {
    await client.close();
  }
}

createAdmin().catch(console.error);
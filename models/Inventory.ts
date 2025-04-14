import mongoose, { Schema } from "mongoose"

const InventorySchema = new Schema({
  itemId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  initialQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema)


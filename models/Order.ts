import mongoose, { Schema } from "mongoose"

// Define the schema for individual order items
const OrderItemSchema = new Schema({
  itemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ["cancelled", "pending", "in-progress", "done", "delivered"],
    default: "pending",
  },
})

// Define the schema for orders
const OrderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
})

// Calculate total amount before saving
OrderSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
  next()
})

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)


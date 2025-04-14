"use client"

import * as React from "react"
import { Order } from "./columns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedOrder: Order) => void
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onSave,
}: OrderDetailsModalProps) {
  const [editedOrder, setEditedOrder] = React.useState<Order | null>(null)

  React.useEffect(() => {
    if (order) {
      setEditedOrder({ ...order })
    }
  }, [order])

  if (!editedOrder) return null

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const response = await fetch(`/api/admin/orders/${editedOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedOrder),
      })

      if (!response.ok) {
        throw new Error("Failed to update order")
      }

      onSave(editedOrder)
      toast({
        title: "Success",
        description: "Order updated successfully",
      })
      onClose()
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order ID</Label>
              <Input value={editedOrder.orderId} disabled />
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={editedOrder.checkoutInfo.name}
                onChange={(e) =>
                  setEditedOrder({
                    ...editedOrder,
                    checkoutInfo: {
                      ...editedOrder.checkoutInfo,
                      name: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editedOrder.checkoutInfo.phone}
                onChange={(e) =>
                  setEditedOrder({
                    ...editedOrder,
                    checkoutInfo: {
                      ...editedOrder.checkoutInfo,
                      phone: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editedOrder.checkoutInfo.date}
                onChange={(e) =>
                  setEditedOrder({
                    ...editedOrder,
                    checkoutInfo: {
                      ...editedOrder.checkoutInfo,
                      date: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Input
                value={editedOrder.checkoutInfo.time_slot}
                onChange={(e) =>
                  setEditedOrder({
                    ...editedOrder,
                    checkoutInfo: {
                      ...editedOrder.checkoutInfo,
                      time_slot: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editedOrder.status}
                onValueChange={(value) =>
                  setEditedOrder({
                    ...editedOrder,
                    status: value as Order["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={editedOrder.paymentStatus}
              onValueChange={(value) =>
                setEditedOrder({
                  ...editedOrder,
                  paymentStatus: value as Order["paymentStatus"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Items</Label>
            <div className="border rounded-md p-4">
              {editedOrder.cart.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x ${item.price} = $
                    {(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                Total: ${editedOrder.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
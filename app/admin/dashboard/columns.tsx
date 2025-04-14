"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Order = {
  _id: string
  orderId: string
  cart: {
    name: string
    price: number
    quantity: number
  }[]
  checkoutInfo: {
    name: string
    phone: string
    time_slot: string
    date: string
  }
  createdAt: string
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  total: number
}

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderId")}</div>,
  },
  {
    accessorKey: "checkoutInfo.name",
    header: "Customer",
    cell: ({ row }) => {
      const checkoutInfo = row.original.checkoutInfo
      return <div>{checkoutInfo.name}</div>
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      return <div className="font-medium">₹{amount.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "completed"
              ? "default"
              : status === "processing"
              ? "secondary"
              : status === "cancelled"
              ? "destructive"
              : "outline"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string
      return (
        <Badge
          variant={
            status === "paid"
              ? "default"
              : status === "failed"
              ? "destructive"
              : "outline"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{format(date, "PPP")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderId)}
            >
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              const event = new CustomEvent('showOrderDetails', { 
                detail: order,
                bubbles: true,
                composed: true
              });
              window.dispatchEvent(event);
            }}>
              View order details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 
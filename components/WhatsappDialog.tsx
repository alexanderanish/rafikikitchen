'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {Mail} from 'lucide-react'
<Mail />

interface WhatsAppDialogProps {
  orderName: string;
  orderNumber: string;
  orderCart: { name: string; quantity: number; price: number }[];
  timeSlot: string;
  date: string;
}

export function WhatsAppDialog({ orderName, orderNumber, orderCart, timeSlot, date }: WhatsAppDialogProps) {
  const generateWhatsAppMessage = () => {
    const orderItems = orderCart
      .map((item) => `${item.name} x${item.quantity} - Rs ${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    const totalPrice = orderCart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

    return `Hello from Rafiki’s Kitchen!\n\nThank you for placing an order with us. To confirm your order please make the payment to 9881153034 (Nihal Passanha) and send us a screenshot of the payment.\n\nHere are the details of your order:\n\n${orderItems}\n\nTOTAL - Rs ${totalPrice}\n\nPick up Details:\nTime slot: ${timeSlot}\nDate: ${date}\n\nPlease use the Send Package option on Dunzo / Pickup or Drop on Swiggy Genie / 2wheeler on Porter\n\nPick up address:\nShunya, 3676, 13th F Main Rd, Channakesahava Nagar, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008\n\nHouse/Flat no.: 2nd floor\n\nLandmark: above Maritech\n\nPlease put the name the order is made in the any instructions space OR in the Chat once your runner is confirmed.\n\nContact no. To use for pick up: 9995887566.\n\nYou can organize the pickup at your selected pick-up time.\n\nThank you for ordering. Looking forward to sharing our sandwiches with you.\n\nWarmth,\nRafiki’s Kitchen`;
  };

  const message = generateWhatsAppMessage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Mail /></Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col h-screen max-h-screen">
        <DialogHeader>
          <DialogTitle>{orderName} || {orderNumber} </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
        <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(message)}>Copy to Clipboard</Button>
          <Button variant="default" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")}>Open in WhatsApp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

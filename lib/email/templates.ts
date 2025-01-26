import { CartItem } from "../../app/store/menuStore";

export function getAdminEmailTemplate(
  cart: CartItem[],
  checkoutInfo: any,
  totalAmount: number,
  orderId: string
) {
  const subject = `New Order Received: ${checkoutInfo.name} (${orderId})`;

  const text = `
New Order Details:

Customer Information:
Name: ${checkoutInfo.name}
Phone: ${checkoutInfo.phone}
Email: ${checkoutInfo.email}

Pickup Details:
Date: ${checkoutInfo.date}
Time Slot: ${checkoutInfo.time_slot}

Order Summary:
${cart.map((item) => `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`).join("\n")}

TOTAL: Rs ${totalAmount}

Preparation Notes:
${cart.map((item) => `${item.name}: ${item.quantity} units`).join("\n")}

Please ensure the order is prepared and ready for pickup on time.

Thank you,
Rafiki's Kitchen
  `;

  const html = `
<h3>New Order Details</h3>

<h4>Customer Information:</h4>
<ul>
  <li><strong>Name:</strong> ${checkoutInfo.name}</li>
  <li><strong>Phone:</strong> ${checkoutInfo.phone}</li>
  <li><strong>Email:</strong> ${checkoutInfo.email}</li>
</ul>

<h4>Pickup Details:</h4>
<ul>
  <li><strong>Date:</strong> ${checkoutInfo.date}</li>
  <li><strong>Time Slot:</strong> ${checkoutInfo.time_slot}</li>
</ul>

<h4>Order Summary:</h4>
<ul>
  ${cart.map((item) => `<li>${item.name} x${item.quantity} - Rs ${item.price * item.quantity}</li>`).join("")}
</ul>

<h4><strong>TOTAL:</strong> Rs ${totalAmount}</h4>

<h4>Preparation Notes:</h4>
<ul>
  ${cart.map((item) => `<li>${item.name}: ${item.quantity} units</li>`).join("")}
</ul>

<p>Please ensure the order is prepared and ready for pickup on time.</p>

<p>Thank you,<br>Rafiki's Kitchen</p>
  `;

  return { subject, text, html };
}

// export function getCustomerEmailTemplate(
//   cart: CartItem[],
//   checkoutInfo: any,
//   totalAmount: number
// ) {
//   const subject = `Order Confirmation from Rafiki’s Kitchen for ${checkoutInfo.name}`;

//   const text = `
// Hello from Rafiki’s Kitchen!

// Thank you for placing an order with us. To confirm your order please make the payment to 9881153034 (Nihal Passanha) and send us a screenshot of the payment.

// Here are the details of your order:

// ${cart.map((item) => `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`).join("\n")}

// TOTAL: Rs ${totalAmount}

// Pick up Details:
// Time slot: ${checkoutInfo.time_slot}
// Date: ${checkoutInfo.date}
// Please use the *Send Package* option on *Dunzo* / Pickup or Drop on *Swiggy Genie* / 2wheeler on *Porter*

// Pick up address:
// Shunya, 3676, 13th F Main Rd, Channakesahava Nagar, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008

// House/Flat no.: 2nd floor

// Landmark: above Maritech

// Please put the name the order is made in the  *any instructions* space OR in the *Chat* once your runner is confirmed.

// Contact no. To use for pick up: 9995887566.

// You can organize the pickup at your selected pick-up time.

// Thank you for ordering. Looking forward to sharing our sandwiches with you.

// Warmth,
// Rafiki’s Kitchen
//   `;

//   const html = `
// <p>Hello from Rafiki’s Kitchen!</p>

// <p>Thank you for placing an order with us. To confirm your order please make the payment to <strong>9881153034 (Nihal Passanha)</strong> and send us a screenshot of the payment.</p>

// <p>Here are the details of your order:</p>

// <p>${cart.map((item) => `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`).join("<br>")}</p>

// <p><strong>TOTAL:</strong> Rs ${totalAmount}</p>

// <p><strong>Pick up Details:</strong><br>
// Time slot: ${checkoutInfo.time_slot}<br>
// Date: ${checkoutInfo.date}</p>

// <p>Please use the <strong>Send Package</strong> option on <strong>Dunzo</strong> / Pickup or Drop on <strong>Swiggy Genie</strong> / 2wheeler on <strong>Porter</strong></p>

// <p>Pick up address: <br>
// Shunya, 3676, 13th F Main Rd, Channakesahava Nagar, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008</p>

// <p>House/Flat no.: 2nd floor</p>
// <p>Landmark: above Maritech</p>

// <p>Please put the name the order is made in the <strong>any instructions</strong> space OR in the <strong>Chat</strong> once your runner is confirmed.</p>

// <p>Contact no. To use for pick up: 9995887566.</p>

// <p>You can organize the pickup at your selected pick-up time.</p>

// <p>Thank you for ordering. Looking forward to sharing our sandwiches with you.</p>

// <p>Warmth,<br>Rafiki’s Kitchen</p>
//   `;

//   return { subject, text, html };
// }
export function getCustomerEmailTemplate(
    cart: CartItem[],
    checkoutInfo: any,
    totalAmount: number
  ) {
    // Format the order details
    const orderDetails = cart
      .map((item) => `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`)
      .join("\n");
  
    const emailText = `
  Hello from Rafiki’s Kitchen!
  
  Thank you for placing an order with us. To confirm your order please make the payment to 9881153034 (Nihal Passanha) and send us a screenshot of the payment.
  
  Here are the details of your order:
  
  ${orderDetails}
  
  TOTAL      - Rs ${totalAmount}
  
  Pick up Details:
  Time slot: ${checkoutInfo.time_slot}
  Date: ${checkoutInfo.date}
  Please use the *Send Package* option on *Dunzo* / Pickup or Drop on *Swiggy Genie* / 2wheeler on *Porter*
  
  Pick up address:
  Shunya, 3676, 13th F Main Rd, Channakesahava Nagar, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008
  
  House/Flat no.: 2nd floor
  
  Landmark: above Maritech
  
  Please put the name the order is made in the  *any instructions* space OR in the *Chat* once your runner is confirmed.
  
  Contact no. To use for pick up: 9995887566.
  
  You can organize the pickup at your selected pick-up time.
  
  Thank you for ordering. Looking forward to sharing our sandwiches with you.
  
  Warmth,
  Rafiki’s Kitchen
    `;
  
    const emailHtml = `
  <p>Hello from Rafiki’s Kitchen!</p>
  
  <p>Thank you for placing an order with us. To confirm your order please make the payment to <strong>9881153034 (Nihal Passanha)</strong> and send us a screenshot of the payment.</p>
  
  <p>Here are the details of your order:</p>
  
  <p>${orderDetails.replace(/\n/g, "<br>")}</p>
  
  <p><strong>TOTAL - Rs ${totalAmount}</strong></p>
  
  <p><strong>Pick up Details:</strong><br>
  Time slot: ${checkoutInfo.time_slot}<br>
  Date: ${checkoutInfo.date}</p>
  
  <p>You can also use this QR code to pay:</p>
  <img src="cid:rafikisLogo" alt="Rafiki's Kitchen QR Code" style="width: 150px; height: auto; margin-top: 20px;" />
  
  <p>Please use the <strong>Send Package</strong> option on <strong>Dunzo</strong> / Pickup or Drop on <strong>Swiggy Genie</strong> / 2wheeler on <strong>Porter</strong></p>
  
  <p>Pick up address: <br>
  Shunya, 3676, 13th F Main Rd, Channakesahava Nagar, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka 560008</p>
  
  <p>House/Flat no.: 2nd floor</p>
  <p>Landmark: above Maritech</p>
  
  <p>Please put the name the order is made in the <strong>any instructions</strong> space OR in the <strong>Chat</strong> once your runner is confirmed.</p>
  
  <p>Contact no. To use for pick up: 9995887566.</p>
  
  <p>You can organize the pickup at your selected pick-up time.</p>
  
  <p>Thank you for ordering. Looking forward to sharing our sandwiches with you.</p>
  
  <p>Warmth,<br>
  Rafiki’s Kitchen</p>
    `;
  
    return { subject: `Order Confirmation from Rafiki’s Kitchen for ${checkoutInfo.name}`, text: emailText, html: emailHtml };
  }
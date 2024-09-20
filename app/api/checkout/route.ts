import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'
import nodemailer from 'nodemailer';

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("rafiki_kitchen")
    const { cart, checkoutInfo } = await request.json()

    const result = await db.collection("orders").insertOne({
      cart,
      checkoutInfo,
      createdAt: new Date(),
      status: 'todo'
    })

    const to= [process.env.EMAIL_ONE,process.env.EMAIL_TWO]

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      secure: true,
    });

    // Verify connection configuration
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
        //   console.error('Error verifying transporter:', error);
          reject(error);
        } else {
        //   console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });
        // Format the order details
        const orderDetails = cart.map((item: CartItem) => {
          return `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`;
        }).join('\n');
    
        const totalAmount = cart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    
        const emailSubject = `Order Confirmation from Rafiki’s Kitchen for ${checkoutInfo.name}`;
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
    
    <p>${orderDetails.replace(/\n/g, '<br>')}</p>
    
    <p><strong>TOTAL - Rs ${totalAmount}</strong></p>
    
    <p><strong>Pick up Details:</strong><br>
    Time slot: ${checkoutInfo.time_slot}<br>
    Date: ${checkoutInfo.date}</p>
    
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
    
        const mailData = {
          from: `"Rafiki’s Kitchen" <${process.env.GMAIL_USER}>`,
          to: Array.isArray(to) ? to.join(', ') : to,
          replyTo: Array.isArray(to) ? to.join(', ') : to,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        };
    
        // Send mail
        await new Promise((resolve, reject) => {
          transporter.sendMail(mailData, (err, info) => {
            if (err) {
            //   console.error('Error sending email:', err);
              reject(err);
            } else {
            //   console.log('Email sent:', info);
              resolve(info);
            }
          });
        });
    // const response = await fetch(`${process.env.VERCEL_URL}/api/send-email`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     to: [process.env.EMAIL_ONE,process.env.EMAIL_TWO],
    //     replyTo:[process.env.EMAIL_ONE,process.env.EMAIL_TWO],
    //     checkoutInfo: checkoutInfo,
    //     cart: cart,
    //   }),
    // });
    // const data = await response.json();
    // if (data.success) {
    //   console.log('Email sent successfully:', data.messageId);
    // } else {
    //   console.error('Error sending email:', data.error);
    // }

    return NextResponse.json({ success: true, orderId: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'An error occurred while processing your order.' }, { status: 500 })
  }
}
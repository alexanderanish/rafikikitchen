import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import nodemailer from 'nodemailer';
import { getAdminEmailTemplate, getCustomerEmailTemplate } from '../../../lib/email/templates';


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('rafiki_kitchen');
    const { cart, checkoutInfo } = await request.json();

    const result = await db.collection('orders').insertOne({
      cart,
      checkoutInfo,
      createdAt: new Date(),
      status: 'todo',
    });

    // const toAdmin = [process.env.EMAIL_ONE, process.env.EMAIL_TWO];
    const toAdmin = [process.env.EMAIL_ONE];
    const toCustomer = checkoutInfo.email;

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
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    // Format the order details
    const orderDetails = cart
      .map(
        (item: CartItem) =>
          `${item.name} x${item.quantity} - Rs ${item.price * item.quantity}`
      )
      .join('\n');

    const totalAmount = cart.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );

    const { subject: adminSubject, text: adminText, html: adminHtml } = getAdminEmailTemplate(
      cart,
      checkoutInfo,
      totalAmount,
      result.insertedId.toString()
    );

    const { subject: customerSubject, text: customerText, html: customerHtml } =
      getCustomerEmailTemplate(cart, checkoutInfo, totalAmount);

    const adminMailData = {
      from: `"Rafiki’s Kitchen" <${process.env.GMAIL_USER}>`,
      to: toAdmin.join(', '),
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
    };

    const customerMailData = {
      from: `"Rafiki’s Kitchen" <${process.env.GMAIL_USER}>`,
      to: toCustomer,
      subject: customerSubject,
      text: customerText,
      html: customerHtml,
      attachments: [
        {
          filename: 'upi.jpeg', // Replace with your image file name
          path: 'https://www.rafikiskitchen.in/_next/image?url=%2Fupi.jpeg&w=828&q=75', // Replace with the path to your logo
          cid: 'rafikisLogo', // Content-ID
        },
      ],
    };

    // Send emails to admin and customer
    await Promise.all([
      transporter.sendMail(adminMailData),
      transporter.sendMail(customerMailData),
    ]);


    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: 'An error occurred while processing your order.' },
      { status: 500 }
    );
  }
}

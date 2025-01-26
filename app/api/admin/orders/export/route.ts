import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('rafiki_kitchen');

    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();

    // Create CSV content
    const csvHeaders = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Date',
      'Time Slot',
      'Sandwich Name',
      'Quantity',
      'Price',
      'Total',
    ];

    const csvRows = [csvHeaders.join(',')];

    orders.forEach((order) => {
      const totalAmount = order.cart.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      );

      order.cart.forEach((item: any) => {
        const row = [
          order._id,
          order.checkoutInfo.name,
          order.checkoutInfo.phone,
          order.checkoutInfo.date,
          order.checkoutInfo.time_slot,
          item.name,
          item.quantity,
          item.price,
          totalAmount,
        ];
        csvRows.push(row.join(','));
      });
    });

    const csvContent = csvRows.join('\n');

    // Generate dynamic filename
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `rafiki_kitchen_order_${formattedDate}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while exporting orders.' },
      { status: 500 }
    );
  }
}

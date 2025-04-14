import clientPromise from './mongodb';

export const DAILY_SANDWICH_LIMIT = 8;

export async function getTotalSandwichesForDate(date: string) {
  try {
    const client = await clientPromise;
    const db = client.db('rafiki_kitchen');

    // Aggregate orders for the given date
    const result = await db.collection('orders').aggregate([
      {
        $match: {
          'checkoutInfo.date': date
        }
      },
      {
        $unwind: '$cart'
      },
      {
        $group: {
          _id: null,
          totalSandwiches: {
            $sum: '$cart.quantity'
          }
        }
      }
    ]).toArray();

    // If no orders found, return 0
    if (!result.length) {
      return 0;
    }

    return result[0].totalSandwiches;
  } catch (error) {
    console.error('Error counting sandwiches:', error);
    throw error;
  }
}

export async function getAvailableSandwichSlots(date: string) {
  try {
    const totalSandwiches = await getTotalSandwichesForDate(date);
    const availableSlots = Math.max(0, DAILY_SANDWICH_LIMIT - totalSandwiches);
    return {
      totalOrdered: totalSandwiches,
      availableSlots,
      isAvailable: availableSlots > 0
    };
  } catch (error) {
    console.error('Error checking available slots:', error);
    throw error;
  }
} 
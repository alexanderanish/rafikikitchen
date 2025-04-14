import { NextResponse } from 'next/server';
import { getAvailableSandwichSlots, DAILY_SANDWICH_LIMIT } from '../../lib/orders';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const availability = await getAvailableSandwichSlots(date);

    return NextResponse.json({
      success: true,
      data: {
        ...availability,
        maxLimit: DAILY_SANDWICH_LIMIT
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
} 
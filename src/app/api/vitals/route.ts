import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log Web Vitals
    console.log('[Web Vitals]', {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      navigationType: body.navigationType
    });

    // Here you can send to your analytics service
    // Example: await analytics.track('web-vital', body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging web vital:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

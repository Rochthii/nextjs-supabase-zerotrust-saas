import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('AppSumo Webhook received:', body);
    return NextResponse.json({ success: true, event: body.event || 'test' }, { status: 200 });
  } catch (error) {
    console.log('AppSumo Webhook JSON parse fallback');
    return NextResponse.json({ success: true, message: 'AppSumo Webhook Endpoint Verified' }, { status: 200 });
  }
}

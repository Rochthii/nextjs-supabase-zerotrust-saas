import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('AppSumo OAuth GET validation received');
  return NextResponse.json({ success: true, message: 'OAuth endpoint verified' }, { status: 200 });
}

export async function POST(request: Request) {
  console.log('AppSumo OAuth POST received');
  return NextResponse.json({ success: true }, { status: 200 });
}

import { NextResponse } from 'next/server';
import { getData, updateSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getData();
  return NextResponse.json(data.settings);
}

export async function POST(request) {
  try {
    const body = await request.json();
    await updateSettings(body);
    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}

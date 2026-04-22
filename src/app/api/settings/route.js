import { NextResponse } from 'next/server';
import { getData, updateSettings } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getData();
  return NextResponse.json(data.settings);
}

export async function POST(request) {
  try {
    const body = await request.json();
    await updateSettings(body);
    revalidatePath('/');       // Invalidate Home Page Router Cache
    revalidatePath('/admin');  // Invalidate Admin Router Cache
    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

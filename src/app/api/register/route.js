import { NextResponse } from 'next/server';
import { addRegistration, getData } from '@/lib/data';

export async function GET() {
  const data = await getData();
  return NextResponse.json({
    registrations: data.registrations,
    total: data.registrations.length
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate fields
    if (!body.fullName || !body.organization || !body.city || !body.whatsapp || !body.email) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    await addRegistration(body);
    return NextResponse.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    if (error.code === '23505') { // Postgres Unique Constraint Error Code
       return NextResponse.json({ success: false, message: 'Email is already registered' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Internal Server Error: ${error.message || 'Unknown'} (Code: ${error.code || 'None'})` }, { status: 500 });
  }
}

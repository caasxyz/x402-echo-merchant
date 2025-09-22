import { NextResponse } from 'next/server';

// a basic GET route, actual response is produced in middleware
export const GET = async () => {
  return NextResponse.json({ ok: true });
};
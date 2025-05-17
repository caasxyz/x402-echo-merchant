import { NextRequest, NextResponse } from 'next/server';

// a basic GET route that returns a message
export const GET = async (request: NextRequest) => {
  return NextResponse.json({ message: 'Hello, world!' });
};
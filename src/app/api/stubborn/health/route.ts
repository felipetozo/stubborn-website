import { NextResponse } from 'next/server';
import { STUBBORN_CLIENT, STUBBORN_CONNECT_VERSION } from '@/lib/stubbornConnect';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    client: STUBBORN_CLIENT,
    version: STUBBORN_CONNECT_VERSION,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getConvex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await getConvex().query(api.games.ping, {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Convex ping failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}

import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'onlyducks',
    integrations: {
      authentication: 'not-configured',
      oscarApi: 'not-configured',
      contentFeed: 'not-configured',
    },
  });
}

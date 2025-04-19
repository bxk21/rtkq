import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
  params: undefined;
}

export async function PATCH(request: NextRequest, context: Context) {
  // const body: { username: string, password: string } = await request.json();
  const ip = request.headers.get('X-Forwarded-For');
  // https://stackoverflow.com/questions/68338838/how-to-get-the-ip-address-of-the-client-from-server-side-in-next-js-app
  // https://nextjs.org/docs/app/building-your-application/upgrading/version-15#nextrequest-geolocation
  return NextResponse.json({ ip });
}

export async function GET(request: NextRequest, context: Context) {
  // const body: { username: string, password: string } = await request.json();
  const ip = request.headers.get('X-Forwarded-For');
  // https://stackoverflow.com/questions/68338838/how-to-get-the-ip-address-of-the-client-from-server-side-in-next-js-app
  // https://nextjs.org/docs/app/building-your-application/upgrading/version-15#nextrequest-geolocation
  return NextResponse.json({ ip });
}

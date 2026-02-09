import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (!process.env.DEV_USER || !process.env.DEV_PASS) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')

  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="StellarMotion Dev"',
      },
    })
  }

  const [, encoded] = auth.split(' ')
  const decoded = atob(encoded)
  const [user, pass] = decoded.split(':')

  if (
    user !== process.env.DEV_USER ||
    pass !== process.env.DEV_PASS
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

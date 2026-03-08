import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        const validUser = process.env.ADMIN_USER || 'admin';
        const validPass = process.env.ADMIN_PASS || 'secret';

        if (user === validUser && pwd === validPass) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

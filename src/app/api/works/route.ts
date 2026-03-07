import { NextResponse } from 'next/server';
import { getWorks } from '@/lib/api/works';

export async function GET() {
    try {
        const works = await getWorks();
        return NextResponse.json(works);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch works' },
            { status: 500 }
        );
    }
}

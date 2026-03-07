import { NextRequest, NextResponse } from 'next/server';
import { getWorkById } from '@/lib/api/works';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js 15, route params are technically a Promise or accessible directly, here assuming we use await properly or standard destructuring according to Next 14/15 rules. In Next 15 `params` is a promise.
) {
    try {
        const { id } = await context.params;
        const work = await getWorkById(id);
        
        if (!work) {
            return NextResponse.json({ error: 'Work not found' }, { status: 404 });
        }

        return NextResponse.json(work);
    } catch (error) {
         return NextResponse.json(
            { error: 'Failed to fetch work' },
            { status: 500 }
        );
    }
}

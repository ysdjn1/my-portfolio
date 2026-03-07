import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        // Toggle the is_public field directly in SQL using NOT and return the new value
        const { rows } = await sql`
            UPDATE works 
            SET is_public = NOT COALESCE(is_public, TRUE) 
            WHERE id = ${id}
            RETURNING is_public
        `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Work not found' }, { status: 404 });
        }

        const newVisibility = rows[0].is_public;
        
        console.log(`Successfully toggled work ID: ${id} visibility to ${newVisibility}.`);

        return NextResponse.json({ success: true, isPublic: newVisibility });

    } catch (error) {
        console.error('Error toggling work visibility:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}

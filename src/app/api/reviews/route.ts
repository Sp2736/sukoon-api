import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Fetch reviews, ordered by newest first
        const { data, error } = await supabase
            .from('reviews')
            .select('id, name, quote, avatar_url')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return the data with CORS headers to allow frontend access
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Adjust this to your specific frontend URL in production for tighter security
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
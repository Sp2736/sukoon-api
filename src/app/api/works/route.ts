import { NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
    // 1. API Key Authentication (matches your properties API logic)
    const authError = await validateApiKey();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');

        const supabase = await createServiceClient();
        
        // 2. Fetch works from the database
        const { data, error } = await supabase
            .from('works')
            .select('*')
            // Add any specific filters here, e.g., .eq('is_published', true) if your schema uses it
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // 3. Return JSON response
        return NextResponse.json({
            success: true,
            data: data || []
        });

    } catch (error: any) {
        console.error("Works API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch works', details: error.message || error },
            { status: 500 }
        );
    }
}
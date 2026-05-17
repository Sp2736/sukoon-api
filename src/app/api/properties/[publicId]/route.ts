import { NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    // 1. API Key Authentication
    const authError = await validateApiKey();
    if (authError) return authError;

    try {
        const { publicId } = await params;
        const supabase = await createServiceClient();

        // 2. Fetch property by public_id
        const { data, error } = await (supabase.from('properties') as any)
            .select(`
                *,
                property_images(image_url, display_order)
            `)
            .eq('public_id', publicId)
            .eq('is_published', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
            }
            throw error;
        }

        // 3. Format Response (Remove internal ID)
        const sortedImages = data.property_images?.sort(
            (a: any, b: any) => a.display_order - b.display_order
        ) || [];

        const { id, ...publicData } = data;

        const formatted = {
            ...publicData,
            property_images: undefined,
            cover_image: sortedImages[0]?.image_url || null,
            images: sortedImages.map((img: any) => img.image_url)
        };

        return NextResponse.json({
            success: true,
            data: formatted
        });

    } catch (error: any) {
        console.error("Single Property API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch property details', details: error.message },
            { status: 500 }
        );
    }
}

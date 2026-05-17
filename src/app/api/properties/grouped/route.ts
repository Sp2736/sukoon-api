import { NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { validateApiKey } from '@/lib/api-auth';
import type { PropertyCategory } from '@/types/database';

const CATEGORIES: PropertyCategory[] = [
    'Residential',
    'Commercial',
    'Agricultural Land',
    'Non-agricultural Land'
];

export async function GET() {
    // 1. API Key Authentication
    const authError = await validateApiKey();
    if (authError) return authError;

    try {
        const supabase = await createServiceClient();

        // 2. Fetch max 3 published properties for each category concurrently
        const fetchCategory = async (category: PropertyCategory) => {
            const { data, error } = await (supabase.from('properties') as any)
                .select(`
                    *,
                    property_images(image_url, display_order)
                `)
                .eq('is_published', true)
                .eq('category', category)
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) throw error;

            // Map and format the images
            const propertiesWithCover = data.map((prop: any) => {
                // Sort images to find the cover (lowest display_order)
                const sortedImages = prop.property_images?.sort(
                    (a: any, b: any) => a.display_order - b.display_order
                ) || [];

                // Destructure to remove the internal id
                const { id, ...publicData } = prop;

                return {
                    ...publicData,
                    property_images: undefined,
                    cover_image: sortedImages[0]?.image_url || null,
                    images: sortedImages.map((img: any) => img.image_url)
                };
            });

            return { category, properties: propertiesWithCover };
        };

        const results = await Promise.all(CATEGORIES.map(fetchCategory));

        // 3. Transform array of results into a grouped object
        const groupedData = results.reduce((acc, curr) => {
            acc[curr.category] = curr.properties;
            return acc;
        }, {} as Record<string, any[]>);

        return NextResponse.json({
            success: true,
            data: groupedData
        });

    } catch (error: any) {
        console.error("Grouped API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch grouped properties', details: error.message },
            { status: 500 }
        );
    }
}

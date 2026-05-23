import { NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
    // 1. API Key Authentication
    const authError = await validateApiKey();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        
        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Filters
        const category = searchParams.get('category');
        const city = searchParams.get('city');
        const minPrice = searchParams.get('min_price');
        const maxPrice = searchParams.get('max_price');
        const configuration = searchParams.get('configuration'); 
        const furnished = searchParams.get('furnished'); 
        const excludeId = searchParams.get('exclude_id'); 
        
        // Sorting
        const sort = searchParams.get('sort') || 'latest'; 

        const supabase = await createServiceClient();
        
        // 2. Build Query
        let query = (supabase.from('properties') as any)
            .select(`
                *,
                property_images(image_url, display_order)
            `, { count: 'exact' })
            .eq('is_published', true);

        // Apply Filters
        if (category) query = query.eq('category', category);
        if (city) query = query.ilike('city', `%${city}%`);
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
        if (configuration) query = query.ilike('configuration', `%${configuration}%`);
        if (furnished) query = query.ilike('description', `%${furnished}%`); 
        if (excludeId) query = query.neq('public_id', excludeId); 

        // Apply Sorting
        switch (sort) {
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'latest':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Apply Pagination
        query = query.range(offset, offset + limit - 1);

        // 3. Execute Query
        const { data, count, error } = await query;

        if (error) throw error;

        // 4. Format Response (Safely fallback if data is null)
        const safeData = data || [];
        const properties = safeData.map((prop: any) => {
            const sortedImages = prop.property_images?.sort(
                (a: any, b: any) => a.display_order - b.display_order
            ) || [];

            const { id, ...publicData } = prop;

            return {
                ...publicData,
                property_images: undefined,
                cover_image: sortedImages[0]?.image_url || null,
                images: sortedImages.map((img: any) => img.image_url)
            };
        });

        // 5. Build Pagination Meta
        const totalItems = count || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            success: true,
            data: properties,
            meta: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit,
                has_next_page: page < totalPages,
                has_prev_page: page > 1
            }
        });

    } catch (error: any) {
        console.error("Properties API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch properties', details: error.message || error },
            { status: 500 }
        );
    }
}
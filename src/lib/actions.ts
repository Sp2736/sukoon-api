'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/supabase/server';
import { propertySchema, inquirySchema, loginSchema } from '@/lib/validations';
import type { PropertyFormValues } from '@/lib/validations';
import type { PropertyRow } from '@/types/database';

// ── Helper ────────────────────────────────────────────────────

function toActionError(e: any): { error: string } {
    console.error("Action error:", e);
    if (e?.message) return { error: e.message };
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred.' };
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

export async function loginAction(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: error.message };

    redirect('/admin/dashboard');
}

export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
}

// ════════════════════════════════════════════════════════════
// PROPERTIES
// ════════════════════════════════════════════════════════════

/** Fetch all properties (admin — bypasses RLS). */
export async function getPropertiesAdmin(): Promise<PropertyRow[]> {
    const supabase = await createServiceClient();
    const { data, error } = await (supabase
        .from('properties') as any)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

/** Fetch only published properties (public). */
export async function getPublishedProperties(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}): Promise<PropertyRow[]> {
    const supabase = await createClient();
    let query = (supabase
        .from('properties') as any)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category as any);
    }
    if (filters?.minPrice) query = query.gte('price', filters.minPrice);
    if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
}

/** Fetch a single property with images. */
export async function getPropertyWithImages(id: string) {
    const supabase = await createClient();
    const { data, error } = await (supabase
        .from('properties') as any)
        .select('*, property_images(*)')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Same but bypasses RLS (admin edit page). */
export async function getPropertyAdmin(id: string) {
    const supabase = await createServiceClient();
    const { data, error } = await (supabase
        .from('properties') as any)
        .select('*, property_images(*)')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Create a new property and attach image URLs. */
export async function createPropertyAction(
    values: PropertyFormValues,
    imageUrls: string[]
) {
    const supabase = await createServiceClient();
    const parsed = propertySchema.safeParse(values);
    if (!parsed.success) return toActionError(parsed.error.issues[0].message);

    const { data: property, error: propError } = await (supabase
        .from('properties') as any)
        .insert({
            ...parsed.data,
            price: parseFloat(parsed.data.price),
            area_value: parsed.data.area_value ? parseFloat(parsed.data.area_value) : null,
            related_properties: parsed.data.related_properties ?? [],
            floor_number: parsed.data.floor_number ?? null,
            zone_type: parsed.data.zone_type ?? null,
            fencing: parsed.data.fencing ?? null,
        })
        .select()
        .single();

    if (propError) return toActionError(propError);

    // Attach images
    if (imageUrls.length > 0) {
        const imageRows = imageUrls.map((url, i) => ({
            property_id: property.id,
            image_url: url,
            display_order: i,
        }));
        const { error: imgError } = await (supabase
            .from('property_images') as any)
            .insert(imageRows);
        if (imgError) return toActionError(imgError);
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, id: property.id };
}

/** Update an existing property and optionally add new images. */
export async function updatePropertyAction(
    id: string,
    values: PropertyFormValues,
    newImageUrls: string[]
) {
    const supabase = await createServiceClient();
    const parsed = propertySchema.safeParse(values);
    if (!parsed.success) return toActionError(parsed.error.issues[0].message);

    const { error: propError } = await (supabase
        .from('properties') as any)
        .update({
            ...parsed.data,
            price: parseFloat(parsed.data.price),
            area_value: parsed.data.area_value ? parseFloat(parsed.data.area_value) : null,
            related_properties: parsed.data.related_properties ?? [],
            floor_number: parsed.data.floor_number ?? null,
            zone_type: parsed.data.zone_type ?? null,
            fencing: parsed.data.fencing ?? null,
        })
        .eq('id', id);

    if (propError) return toActionError(propError);

    // Append new images
    if (newImageUrls.length > 0) {
        // Get current max display_order
        const { data: existing } = await (supabase
            .from('property_images') as any)
            .select('display_order')
            .eq('property_id', id)
            .order('display_order', { ascending: false })
            .limit(1);

        const startOrder = (existing?.[0]?.display_order ?? -1) + 1;
        const imageRows = newImageUrls.map((url, i) => ({
            property_id: id,
            image_url: url,
            display_order: startOrder + i,
        }));
        const { error: imgError } = await (supabase
            .from('property_images') as any)
            .insert(imageRows);
        if (imgError) return toActionError(imgError);
    }

    revalidatePath('/admin/dashboard');
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');
    return { success: true };
}

/** Delete a property (cascades to images + inquiries via FK). */
export async function deletePropertyAction(id: string) {
    const supabase = await createServiceClient();
    const { error } = await (supabase.from('properties') as any).delete().eq('id', id);
    if (error) return toActionError(error);

    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true };
}

/** Delete a single property image row and its storage object. */
export async function deletePropertyImageAction(imageId: string) {
    const supabase = await createServiceClient();
    const { error } = await (supabase
        .from('property_images') as any)
        .delete()
        .eq('id', imageId);
    if (error) return toActionError(error);
    return { success: true };
}

// ════════════════════════════════════════════════════════════
// INQUIRIES
// ════════════════════════════════════════════════════════════

export async function submitInquiryAction(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const supabase = await createClient();
    const { error } = await (supabase.from('inquiries') as any).insert({
        ...parsed.data,
        message: parsed.data.message || null,
    });

    if (error) return toActionError(error);
    return { success: true };
}

export async function getInquiriesAdmin() {
    const supabase = await createServiceClient();
    const { data, error } = await (supabase
        .from('inquiries') as any)
        .select('*, properties(title)')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
}

// ════════════════════════════════════════════════════════════
// ACCOUNTS / LEDGER
// ════════════════════════════════════════════════════════════

import { transactionSchema, type TransactionFormValues } from './validations';

export async function getTransactionsAdmin() {
    const supabase = await createServiceClient();
    const { data, error } = await (supabase
        .from('transactions') as any)
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function createTransactionAction(values: TransactionFormValues) {
    const supabase = await createServiceClient();
    const parsed = transactionSchema.safeParse(values);
    if (!parsed.success) return toActionError(parsed.error.issues[0].message);

    const { error } = await (supabase.from('transactions') as any).insert({
        ...parsed.data,
        amount: parseFloat(parsed.data.amount),
    });

    if (error) return toActionError(error);

    revalidatePath('/admin/accounts');
    return { success: true };
}

export async function deleteTransactionAction(id: string) {
    const supabase = await createServiceClient();
    const { error } = await (supabase.from('transactions') as any).delete().eq('id', id);
    if (error) return toActionError(error);

    revalidatePath('/admin/accounts');
    return { success: true };
}
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function validateApiKey() {
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');

    const validKey = process.env.PUBLIC_API_KEY;

    if (!validKey) {
        console.warn("PUBLIC_API_KEY is not set in environment variables.");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!apiKey || apiKey !== validKey) {
        return NextResponse.json({ error: "Unauthorized: Invalid or missing API key" }, { status: 401 });
    }

    return null; // Null means validation passed
}

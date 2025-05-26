import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { file } = body;

    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: 'products',
        });
        return NextResponse.json({ url: result.secure_url });
    } catch (error) {
        return NextResponse.json({ error: 'Upload failed', detail: error }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const ext = file.name.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

        // Write file
        await writeFile(filepath, buffer);
        
        // Return public URL
        const url = `/uploads/${filename}`;
        
        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

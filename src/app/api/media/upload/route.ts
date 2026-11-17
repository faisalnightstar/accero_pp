import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary/upload';
import { getServiceFolderCategory } from '@/lib/cloudinary/folders';
import { CloudinaryFolderCategory, CompressionProfileName } from '@/lib/cloudinary/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload assets.' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let base64Input: string | null = null;
    let folder: CloudinaryFolderCategory = 'documents/photographs';
    let profile: CompressionProfileName = 'documentPhoto';
    let isPrivate = true;
    let docType = 'pan';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form-data.' }, { status: 400 });
      }

      const rawFolder = formData.get('folder') as string | null;
      const rawProfile = formData.get('profile') as CompressionProfileName | null;
      const rawDocType = formData.get('docType') as string | null;
      const rawIsPrivate = formData.get('isPrivate');

      if (rawDocType) docType = rawDocType;
      if (rawFolder) {
        folder = rawFolder as CloudinaryFolderCategory;
      } else if (rawDocType) {
        folder = getServiceFolderCategory(rawDocType);
      }

      if (rawProfile) profile = rawProfile;
      if (rawIsPrivate !== null) isPrivate = rawIsPrivate === 'true' || rawIsPrivate === '1';

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.dataUrl && !body.base64) {
        return NextResponse.json({ error: 'No dataUrl or base64 provided in JSON.' }, { status: 400 });
      }

      base64Input = body.dataUrl || body.base64;
      if (body.docType) docType = body.docType;
      if (body.folder) {
        folder = body.folder as CloudinaryFolderCategory;
      } else if (body.docType) {
        folder = getServiceFolderCategory(body.docType);
      }

      if (body.profile) profile = body.profile;
      if (typeof body.isPrivate === 'boolean') isPrivate = body.isPrivate;
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 415 }
      );
    }

    const inputData = fileBuffer || base64Input;
    if (!inputData) {
      return NextResponse.json({ error: 'Failed to extract image data.' }, { status: 400 });
    }

    const uploadResult = await uploadImageToCloudinary(inputData, {
      folder,
      profile,
      isPrivate,
      docType,
      userId: session.userId,
      tags: ['app-upload', docType.toLowerCase(), folder],
    });

    if (!uploadResult.success || !uploadResult.metadata) {
      return NextResponse.json(
        { error: uploadResult.error || 'Cloudinary upload failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metadata: uploadResult.metadata,
      secureUrl: uploadResult.metadata.secureUrl,
      publicId: uploadResult.metadata.publicId,
    });
  } catch (error: any) {
    console.error('[API/Media/Upload] Error processing image upload:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during upload.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { replaceUserAvatar, executeSafeAssetCleanup } from '@/lib/cloudinary/assetReplacement';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let inputData: Buffer | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('avatar') || formData.get('file');
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No avatar file provided.' }, { status: 400 });
      }
      const arrayBuf = await (file as File).arrayBuffer();
      inputData = Buffer.from(arrayBuf);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      inputData = body.dataUrl || body.base64 || body.avatar;
      if (!inputData) {
        return NextResponse.json({ error: 'No avatar base64 data provided.' }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 415 }
      );
    }

    const result = await replaceUserAvatar({
      userId: session.userId,
      newImageInput: inputData,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Avatar replacement failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar: result.newAsset?.secureUrl,
      metadata: result.newAsset,
      cleanupStatus: result.cleanupStatus,
      oldAsset: result.oldAsset,
    });
  } catch (error: any) {
    console.error('[API/Avatar] Replacement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to replace avatar.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const oldPublicId = user.avatarMetadata?.publicId;
    user.avatar = undefined;
    user.avatarMetadata = undefined;
    await user.save();

    if (oldPublicId) {
      await executeSafeAssetCleanup({
        publicId: oldPublicId,
        deliveryType: 'upload',
        resourceType: 'image',
        userId: session.userId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete avatar.' },
      { status: 500 }
    );
  }
}

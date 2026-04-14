import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const token = searchParams.get('token');

  if (!fileId || !token) {
    return NextResponse.json({ error: 'Missing fileId or token' }, { status:400 });
  }

  try {
    // Fetch from Google Drive API
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Drive API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch from Google Drive' }, { status: response.status });
    }

    // Stream the binary data back to the client
    // Note: We mirror the content-type and content-length if available
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    
    // Support range requests for better seeking performance
    headers.set('Accept-Ranges', 'bytes');

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

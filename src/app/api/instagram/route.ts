
import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure API route to fetch Instagram media for @ash.galleryyy.
 * Uses the Instagram Basic Display API.
 */

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'Instagram Access Token is not configured.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,media_type&access_token=${token}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Instagram API');
    }

    const data = await response.json();
    
    // Filter for images/videos only and map to our expected structure
    const posts = data.data.map((post: any) => ({
      id: post.id,
      media_url: post.media_url,
      permalink: post.permalink,
      caption: post.caption || '',
      timestamp: post.timestamp,
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Instagram API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Instagram feed.' },
      { status: 500 }
    );
  }
}

const FIELDS = "id,caption,media_type,media_url,permalink,timestamp";
const MAX_POSTS = 200;
// Instagram's signed media URLs expire after ~5 days, so refetch before they go stale.
const REVALIDATE_SECONDS = 3 * 24 * 60 * 60;
const TOKEN_KEY = "instagram_access_token";
const HIDDEN_OLDEST_POSTS = 6;

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
};

type InstagramPage = {
  data: InstagramMedia[];
  paging?: { next?: string };
};

// The monthly GitHub Action writes each renewed token here; the env var is only the initial seed.
async function getAccessToken(): Promise<string | undefined> {
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/get/${TOKEN_KEY}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      next: { revalidate: 24 * 60 * 60 },
    });
    if (res.ok) {
      const { result } = await res.json();
      if (result) return result;
    } else {
      console.error("Token store error", res.status);
    }
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ error: "Instagram is not connected." }, { status: 503 });
  }

  const media: InstagramMedia[] = [];
  let url: string | undefined =
    `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=100&access_token=${encodeURIComponent(token)}`;

  while (url && media.length < MAX_POSTS) {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.error("Instagram API error", res.status, await res.text());
      return Response.json({ error: "Could not load Instagram posts." }, { status: 502 });
    }
    const page: InstagramPage = await res.json();
    media.push(...page.data);
    url = page.paging?.next;
  }

  // Instagram lists newest first; only trim when the whole feed was fetched, or we'd cut the wrong posts.
  const visible = url ? media : media.slice(0, -HIDDEN_OLDEST_POSTS);

  const posts = visible
    .filter((m) => m.media_type !== "VIDEO")
    .slice(0, MAX_POSTS)
    .map((m) => ({
      id: m.id,
      caption: m.caption ?? "",
      media_url: m.media_url,
      permalink: m.permalink,
      // Instagram returns "+0000" offsets, which Safari's Date parser rejects.
      timestamp: new Date(m.timestamp).toISOString(),
    }));

  return Response.json({ posts });
}

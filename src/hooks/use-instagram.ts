"use client";

import { useEffect, useState } from "react";

export interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  timestamp: string;
}

// One request per visit, shared by the gallery and the travel log.
let cache: Promise<InstagramPost[]> | null = null;

function load() {
  cache ??= fetch("/api/instagram")
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data: { posts: InstagramPost[] }) => data.posts)
    .catch((error) => {
      cache = null;
      throw error;
    });
  return cache;
}

export function useInstagram() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    load()
      .then((p) => live && setPosts(p))
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return { posts, loading, failed };
}

/** First line of a caption, without the hashtags. */
export const captionTitle = (caption: string) => caption.split("\n")[0].replace(/#\S+/g, "").trim();
/** The hashtags a caption carries, as written. */
export const captionTags = (caption: string) => caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];

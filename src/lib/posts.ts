import { mockPosts } from "@/data/posts";
import type { Post, PostCategory } from "@/types/content";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { pendingPostsQuery, postBySlugQuery, postsQuery } from "./sanity/queries";

export async function getPosts(category?: PostCategory): Promise<Post[]> {
  let posts: Post[];
  if (isSanityConfigured && sanityClient) {
    posts = await sanityClient.fetch<Post[]>(postsQuery);
  } else {
    posts = mockPosts.filter((post) => post.status === "published");
  }
  return category ? posts.filter((post) => post.category === category) : posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (isSanityConfigured && sanityClient) {
    const post = await sanityClient.fetch<Post | null>(postBySlugQuery, { slug });
    return post ?? null;
  }
  return mockPosts.find((post) => post.slug === slug) ?? null;
}

export async function getPendingPosts(): Promise<Post[]> {
  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<Post[]>(pendingPostsQuery);
  }
  return mockPosts.filter((post) => post.status === "pending");
}

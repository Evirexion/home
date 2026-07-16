import { mockPosts } from "@/data/posts";
import type { Post, PostCategory } from "@/types/content";
import { getSanityWriteClient, isSanityConfigured, sanityClient } from "./sanity/client";
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

export interface DraftPostInput {
  title: string;
  category: PostCategory;
  tag: string;
  excerpt: string;
  body: string;
  author: string;
}

/** Creates a `status: "pending"` draft in Sanity for a real editor to review and publish. */
export async function createDraftPost(input: DraftPostInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const writeClient = getSanityWriteClient();
  if (!writeClient) {
    return {
      ok: false,
      error: "Sanity no está conectado todavía, así que este borrador no se pudo guardar. Configura SANITY_API_WRITE_TOKEN.",
    };
  }
  const slug = input.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await writeClient.create({
    _type: "post",
    title: input.title,
    slug: { _type: "slug", current: slug },
    category: input.category,
    tag: input.tag,
    excerpt: input.excerpt,
    body: [
      {
        _type: "block",
        _key: "block-0",
        style: "normal",
        children: [{ _type: "span", _key: "span-0", text: input.body }],
      },
    ],
    author: input.author || "Redacción E-VIREXION",
    publishedAt: new Date().toISOString(),
    status: "pending",
  });

  return { ok: true };
}

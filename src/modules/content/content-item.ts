export type ContentType = 'ARTICLE' | 'JOB' | 'PRODUCT';

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  summary?: string;
  destinationUrl: string;
  source: string;
  publishedAt?: string;
};

/**
 * TODO: replace with a server-side adapter to the approved content API/feed.
 * Never label sample data as live production content.
 */
export async function getContentItems(): Promise<ContentItem[]> {
  return [];
}

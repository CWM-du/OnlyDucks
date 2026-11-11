export type IntegrationAvailability = 'demo' | 'not-connected';

export type PreviewIdentity = {
  status: 'not-connected';
  explanation: string;
};

export type MentorProfile = {
  id: string;
  name: string;
  focus: string;
};

export type MentorSessionResult =
  | { status: 'not-connected'; explanation: string }
  | { status: 'created'; sessionId: string };

export type FeedItem = {
  id: string;
  type: 'article' | 'job' | 'product';
  title: string;
  url: string;
};

export interface IdentityProvider {
  getIdentity(): Promise<PreviewIdentity>;
}

export interface MentorProvider {
  listProfiles(): Promise<MentorProfile[]>;
  startSession(profileId: string): Promise<MentorSessionResult>;
}

export interface ContentProvider {
  listItems(): Promise<FeedItem[]>;
}

export interface AnalyticsProvider {
  track(event: string, properties?: Record<string, string>): Promise<void>;
}

export type OnlyDucksProviders = {
  identity: IdentityProvider;
  mentors: MentorProvider;
  content: ContentProvider;
  analytics: AnalyticsProvider;
};

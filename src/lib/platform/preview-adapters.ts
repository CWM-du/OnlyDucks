import type {
  AnalyticsProvider,
  ContentProvider,
  IdentityProvider,
  MentorProvider,
  OnlyDucksProviders,
} from './contracts';

const identity: IdentityProvider = {
  async getIdentity() {
    return {
      status: 'not-connected',
      explanation: 'Shared sign-in is not simulated. Connect the approved SSO provider before enabling identity.',
    };
  },
};

const mentors: MentorProvider = {
  async listProfiles() {
    return [];
  },
  async startSession() {
    return {
      status: 'not-connected',
      explanation: 'Mentor sessions require the approved Oscar API and server-side session service.',
    };
  },
};

const content: ContentProvider = {
  async listItems() {
    return [];
  },
};

const analytics: AnalyticsProvider = {
  async track() {
    // Deliberately no-op: preview mode must not emit production analytics.
  },
};

export const previewProviders: OnlyDucksProviders = {
  identity,
  mentors,
  content,
  analytics,
};

export const previewIntegrationCards = [
  {
    id: 'identity',
    name: 'Shared identity & SSO',
    owner: 'DEV02',
    availability: 'not-connected',
    explanation: 'A provider contract is ready. Authentication is never faked in the browser preview.',
    replacement: 'Replace previewProviders.identity with the approved SSO-backed identity provider.',
  },
  {
    id: 'mentors',
    name: 'Mentor profiles & sessions',
    owner: 'DEV01 / DEV02',
    availability: 'not-connected',
    explanation: 'Session creation stays disabled until Oscar API, server persistence, and access controls are ready.',
    replacement: 'Replace previewProviders.mentors with the Oscar API + session service adapter.',
  },
  {
    id: 'content',
    name: 'Articles, jobs & products',
    owner: 'Content integration',
    availability: 'not-connected',
    explanation: 'No fabricated feed entries are shown. The preview returns an empty collection.',
    replacement: 'Replace previewProviders.content with the approved notodoescodigo.com feed adapter.',
  },
  {
    id: 'analytics',
    name: 'Attribution & analytics',
    owner: 'DEV01 / DEV03',
    availability: 'not-connected',
    explanation: 'The preview adapter intentionally emits no production analytics events.',
    replacement: 'Replace previewProviders.analytics with the approved analytics endpoint and consent rules.',
  },
  {
    id: 'agent',
    name: 'AI agent workspace',
    owner: 'DEV03 / DEV01',
    availability: 'demo',
    explanation: 'The agent page runs a deterministic local adapter for planning and blueprint interactions.',
    replacement: 'Replace the AgentAdapter with the approved Oscar API client without changing the UI contract.',
  },
] as const;

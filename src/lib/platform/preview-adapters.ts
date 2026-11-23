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
      explanation: 'Shared sign-in is intentionally not simulated in the client preview. Connect the agreed SSO provider before authenticated pilot use.',
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
      explanation: 'Oscar owns the Oscar API implementation and connection. Live mentor sessions remain disabled until that integration and server-side session controls are ready.',
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
    owner: 'SSO integration',
    availability: 'not-connected',
    explanation: 'SSO is a priority before authenticated pilot use. It is intentionally not simulated in the visual client preview.',
    replacement: 'Connect the agreed notodoescodigo identity provider and verify login, callback, logout, expiry and account mapping.',
  },
  {
    id: 'mentors',
    name: 'Mentor profiles & sessions',
    owner: 'Oscar',
    availability: 'not-connected',
    explanation: 'Mentor profile concepts are visible, but live conversations are not connected. Oscar will implement and connect the Oscar API.',
    replacement: 'Oscar replaces the preview mentor adapter with the agreed Oscar API and session-service integration.',
  },
  {
    id: 'content',
    name: 'Articles, jobs & products',
    owner: 'Content integration',
    availability: 'not-connected',
    explanation: 'No fabricated feed entries are shown. The preview returns an empty collection until the approved source is connected.',
    replacement: 'Replace previewProviders.content with the approved notodoescodigo.com feed adapter.',
  },
  {
    id: 'analytics',
    name: 'Attribution & analytics',
    owner: 'Analytics integration',
    availability: 'not-connected',
    explanation: 'The preview adapter intentionally emits no production analytics events.',
    replacement: 'Replace previewProviders.analytics with the approved analytics endpoint and consent rules.',
  },
  {
    id: 'agent',
    name: 'AI agent workspace',
    owner: 'Local visual demo',
    availability: 'demo',
    explanation: 'The agent page runs a deterministic local adapter for planning and blueprint interactions; it does not call an AI model.',
    replacement: 'Oscar can connect the approved AI backend while preserving the reviewed UI contract.',
  },
] as const;

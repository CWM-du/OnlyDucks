export type MentorProfileDefinition = {
  slug: string;
  name: string;
  technology: string;
  teachingStyle: string;
  promptKey: string;
};

/**
 * Product owner must confirm these initial profile definitions.
 * Prompt contents and provider-specific configuration should be maintained
 * server-side and must not be exposed to public clients.
 */
export const initialMentorProfiles: MentorProfileDefinition[] = [
  {
    slug: 'python-socratic',
    name: 'Python Socratic',
    technology: 'Python',
    teachingStyle: 'Socratic',
    promptKey: 'python-socratic-v1',
  },
  {
    slug: 'interview-prep',
    name: 'Interview Preparation',
    technology: 'General software engineering',
    teachingStyle: 'Interview practice',
    promptKey: 'interview-prep-v1',
  },
  {
    slug: 'devops-cloud',
    name: 'DevOps & Cloud Mentor',
    technology: 'DevOps & Cloud',
    teachingStyle: 'Architecture and deployments',
    promptKey: 'devops-cloud-v1',
  },
];

import type { AgentAdapter, AgentBlueprint } from './types';

const defaultSteps = [
  {
    id: 'orient',
    title: 'Clarify the goal',
    description: 'Turn the request into a specific outcome and identify what you already know.',
    output: 'A focused objective and success criteria',
  },
  {
    id: 'practice',
    title: 'Work through a practical challenge',
    description: 'Break the topic into a small exercise with checkpoints and useful feedback.',
    output: 'A hands-on exercise and review checklist',
  },
  {
    id: 'demonstrate',
    title: 'Create evidence of progress',
    description: 'Package the result into something you can explain, share, or use in an interview.',
    output: 'A portfolio-ready artefact or learning summary',
  },
];

export const demoAgentAdapter: AgentAdapter = {
  createBlueprint(prompt: string): AgentBlueprint {
    const objective = prompt.trim().replace(/[.!?]+$/, '');
    return {
      title: 'Your learning blueprint',
      objective: objective || 'Build a practical next step',
      audience: 'Developer learning journey',
      estimatedTime: 'A few focused sessions',
      steps: defaultSteps.map((step) => ({ ...step })),
    };
  },

  refineBlueprint(blueprint: AgentBlueprint, instruction: string): AgentBlueprint {
    const normalized = instruction.trim();
    if (!normalized) return blueprint;
    const steps = blueprint.steps.map((step, index) =>
      index === 1
        ? { ...step, description: `${step.description} Adaptation: ${normalized}.` }
        : step,
    );
    return {
      ...blueprint,
      title: 'Refined learning blueprint',
      steps,
    };
  },
};

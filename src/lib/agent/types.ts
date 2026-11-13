export type AgentMode = 'chat' | 'build';

export type BlueprintStep = {
  id: string;
  title: string;
  description: string;
  output: string;
};

export type AgentBlueprint = {
  title: string;
  objective: string;
  audience: string;
  estimatedTime: string;
  steps: BlueprintStep[];
};

export interface AgentAdapter {
  createBlueprint(prompt: string): AgentBlueprint;
  refineBlueprint(blueprint: AgentBlueprint, instruction: string): AgentBlueprint;
}

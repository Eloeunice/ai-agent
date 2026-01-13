/**
 * Type definitions for the TECNOPS hierarchy structure
 * These types match the Zod schema in lib/schemas/backlog.ts
 */

export interface Task {
  title: string;
  description: string;
  acceptance_criteria: string[];
}

export interface SubBug {
  title: string;
  description: string;
  acceptance_criteria: string[];
}

export interface UserStory {
  title: string;
  description: string;
  tasks: Task[];
  sub_bugs: SubBug[];
}

export interface Bug {
  title: string;
  description: string;
  tasks: Task[];
  sub_bugs: SubBug[];
}

export interface Feature {
  title: string;
  description: string;
  user_stories: UserStory[];
  bugs: Bug[];
}

export interface Epic {
  title: string;
  description: string;
  features: Feature[];
}

export interface GenerateTasksResponse {
  epics: Epic[];
}

export interface GenerateTasksRequest {
  userId?: string;
  projectName?: string;
  scope: string;
}


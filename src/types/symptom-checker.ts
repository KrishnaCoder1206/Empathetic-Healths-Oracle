
export type Symptom = {
  id: string;
  name: string;
  description?: string;
};

export type BodyArea = {
  id: string;
  name: string;
  symptoms: Symptom[];
};

export type MessageType = 'bot' | 'user' | 'options' | 'results';

export type Message = {
  id: string;
  type: MessageType;
  content: string;
  options?: string[];
  timestamp: Date;
};

export type HealthCondition = {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high';
};

export type ConditionResult = {
  condition: HealthCondition;
  matchScore: number; // 0-100 percentage match
};

export enum QuestionStage {
  Initial = 'initial',
  BodyArea = 'bodyArea',
  Symptoms = 'symptoms',
  Details = 'details',
  Duration = 'duration',
  Severity = 'severity',
  Additional = 'additional',
  Results = 'results',
}

export interface QuestionFlow {
  stage: QuestionStage;
  question: string;
  options?: string[];
  nextStage: QuestionStage | ((response: string) => QuestionStage);
}

export type FeedbackType = 'helpful' | 'unhelpful' | null;

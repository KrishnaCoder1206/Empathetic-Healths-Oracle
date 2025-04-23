
import { BodyArea, HealthCondition, QuestionFlow, QuestionStage, Symptom } from "@/types/symptom-checker";

// Define body areas with common symptoms
export const bodyAreas: BodyArea[] = [
  {
    id: "head",
    name: "Head",
    symptoms: [
      { id: "headache", name: "Headache" },
      { id: "dizziness", name: "Dizziness" },
      { id: "vision_changes", name: "Vision changes" },
      { id: "facial_pain", name: "Facial pain" },
    ],
  },
  {
    id: "chest",
    name: "Chest",
    symptoms: [
      { id: "chest_pain", name: "Chest pain" },
      { id: "shortness_of_breath", name: "Shortness of breath" },
      { id: "palpitations", name: "Heart palpitations" },
      { id: "cough", name: "Cough" },
    ],
  },
  {
    id: "abdomen",
    name: "Abdomen",
    symptoms: [
      { id: "abdominal_pain", name: "Abdominal pain" },
      { id: "nausea", name: "Nausea" },
      { id: "vomiting", name: "Vomiting" },
      { id: "diarrhea", name: "Diarrhea" },
      { id: "constipation", name: "Constipation" },
    ],
  },
  {
    id: "musculoskeletal",
    name: "Joints & Muscles",
    symptoms: [
      { id: "joint_pain", name: "Joint pain" },
      { id: "muscle_pain", name: "Muscle pain" },
      { id: "swelling", name: "Swelling" },
      { id: "limited_mobility", name: "Limited mobility" },
    ],
  },
  {
    id: "general",
    name: "General",
    symptoms: [
      { id: "fever", name: "Fever" },
      { id: "fatigue", name: "Fatigue" },
      { id: "weight_loss", name: "Weight loss" },
      { id: "sleep_issues", name: "Sleep issues" },
    ],
  },
];

// Flattened list of all symptoms
export const allSymptoms = bodyAreas.flatMap(area => area.symptoms);

// Define possible health conditions with symptoms and urgency
export const healthConditions: HealthCondition[] = [
  {
    id: "common_cold",
    name: "Common Cold",
    description: "A viral infection of the upper respiratory tract that primarily affects the nose and throat.",
    symptoms: ["cough", "fever", "headache", "fatigue"],
    urgency: "low",
  },
  {
    id: "migraine",
    name: "Migraine",
    description: "A severe, recurring headache, often accompanied by other symptoms like nausea and sensitivity to light.",
    symptoms: ["headache", "vision_changes", "nausea", "fatigue"],
    urgency: "medium",
  },
  {
    id: "gastroenteritis",
    name: "Gastroenteritis",
    description: "Inflammation of the stomach and intestines, typically resulting from a viral or bacterial infection.",
    symptoms: ["abdominal_pain", "nausea", "vomiting", "diarrhea", "fever"],
    urgency: "medium",
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    description: "Inflammation of the appendix that can cause severe pain and requires immediate medical attention.",
    symptoms: ["abdominal_pain", "nausea", "vomiting", "fever"],
    urgency: "high",
  },
  {
    id: "heart_attack",
    name: "Heart Attack",
    description: "A serious medical emergency where blood flow to part of the heart is blocked, potentially causing damage to heart muscle.",
    symptoms: ["chest_pain", "shortness_of_breath", "nausea", "fatigue", "dizziness"],
    urgency: "high",
  },
  {
    id: "tension_headache",
    name: "Tension Headache",
    description: "A common type of headache that feels like pressure or tightness around the head.",
    symptoms: ["headache", "fatigue", "sleep_issues"],
    urgency: "low",
  },
  {
    id: "bronchitis",
    name: "Bronchitis",
    description: "Inflammation of the bronchial tubes which carry air to and from the lungs.",
    symptoms: ["cough", "shortness_of_breath", "chest_pain", "fatigue", "fever"],
    urgency: "medium",
  },
  {
    id: "arthritis",
    name: "Arthritis",
    description: "Inflammation of one or more joints, causing pain and stiffness that can worsen with age.",
    symptoms: ["joint_pain", "swelling", "limited_mobility", "fatigue"],
    urgency: "medium",
  },
  {
    id: "food_poisoning",
    name: "Food Poisoning",
    description: "Illness caused by eating contaminated food containing infectious organisms or toxins.",
    symptoms: ["abdominal_pain", "nausea", "vomiting", "diarrhea", "fever"],
    urgency: "medium",
  },
  {
    id: "sinusitis",
    name: "Sinusitis",
    description: "Inflammation or swelling of the tissue lining the sinuses that can cause facial pain and pressure.",
    symptoms: ["facial_pain", "headache", "cough", "fever"],
    urgency: "low",
  },
];

// Question flow for symptom collection
export const questionFlow: Record<QuestionStage, QuestionFlow> = {
  [QuestionStage.Initial]: {
    stage: QuestionStage.Initial,
    question: "Hello! I'm your health assistant. I can help you understand what might be causing your symptoms. Let's start by determining where your main symptoms are located. How can I help you today?",
    nextStage: QuestionStage.BodyArea,
  },
  [QuestionStage.BodyArea]: {
    stage: QuestionStage.BodyArea,
    question: "Which area of your body is giving you the most trouble?",
    options: bodyAreas.map(area => area.name),
    nextStage: QuestionStage.Symptoms,
  },
  [QuestionStage.Symptoms]: {
    stage: QuestionStage.Symptoms,
    question: "What symptoms are you experiencing?",
    // Options will be populated dynamically based on body area selection
    nextStage: QuestionStage.Duration,
  },
  [QuestionStage.Details]: {
    stage: QuestionStage.Details,
    question: "Please provide more details about your symptoms. Are there any specific triggers or patterns you've noticed?",
    nextStage: QuestionStage.Duration,
  },
  [QuestionStage.Duration]: {
    stage: QuestionStage.Duration,
    question: "How long have you been experiencing these symptoms?",
    options: ["Less than 24 hours", "1-3 days", "3-7 days", "1-2 weeks", "More than 2 weeks"],
    nextStage: QuestionStage.Severity,
  },
  [QuestionStage.Severity]: {
    stage: QuestionStage.Severity,
    question: "On a scale from 1 to 10, how severe would you rate your symptoms? (1 being barely noticeable, 10 being the worst pain/discomfort imaginable)",
    options: ["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"],
    nextStage: QuestionStage.Additional,
  },
  [QuestionStage.Additional]: {
    stage: QuestionStage.Additional,
    question: "Do you have any other symptoms or medical conditions we should be aware of?",
    nextStage: QuestionStage.Results,
  },
  [QuestionStage.Results]: {
    stage: QuestionStage.Results,
    question: "Thank you for providing that information. Based on what you've told me, here are some potential conditions that might explain your symptoms:",
    nextStage: QuestionStage.Initial, // Reset to beginning if user wants to start over
  },
};

// Helper function to find symptom by name
export const findSymptomByName = (name: string): Symptom | undefined => {
  return allSymptoms.find(symptom => symptom.name.toLowerCase() === name.toLowerCase());
};

// Helper function to find body area by name
export const findBodyAreaByName = (name: string): BodyArea | undefined => {
  return bodyAreas.find(area => area.name.toLowerCase() === name.toLowerCase());
};

// Function to analyze symptoms and predict conditions
export const predictConditions = (symptomIds: string[]): HealthCondition[] => {
  // Simple prediction algorithm - match symptoms to conditions
  const matchedConditions = healthConditions
    .map(condition => {
      const matchCount = symptomIds.filter(id => condition.symptoms.includes(id)).length;
      const matchScore = symptomIds.length > 0 ? matchCount / symptomIds.length : 0;
      
      return {
        condition,
        matchScore: Math.round(matchScore * 100),
      };
    })
    .filter(result => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  
  // Return the top 3 matched conditions
  return matchedConditions.slice(0, 3).map(result => result.condition);
};

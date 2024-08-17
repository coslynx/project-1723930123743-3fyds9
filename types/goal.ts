import { User } from './user';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: GoalCategory;
  status: GoalStatus;
  privacy: GoalPrivacy;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  Progress?: Progress[];
}

export enum GoalCategory {
  WeightLoss = 'WeightLoss',
  MuscleGain = 'MuscleGain',
  Endurance = 'Endurance',
  Flexibility = 'Flexibility',
  Strength = 'Strength',
  GeneralFitness = 'GeneralFitness',
  Nutrition = 'Nutrition',
  MentalHealth = 'MentalHealth',
  Custom = 'Custom'
}

export enum GoalStatus {
  Active = 'Active',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
  Paused = 'Paused'
}

export enum GoalPrivacy {
  Public = 'Public',
  FriendsOnly = 'FriendsOnly',
  Private = 'Private'
}

export interface GoalCreateInput {
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  targetValue: number;
  unit: string;
  category: GoalCategory;
  privacy: GoalPrivacy;
}

export interface GoalUpdateInput {
  title?: string;
  description?: string;
  targetDate?: Date;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  privacy?: GoalPrivacy;
}

export interface GoalWithProgress extends Goal {
  progressPercentage: number;
  recentProgress: Progress[];
}

export interface GoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  abandonedGoals: number;
}

export function calculateGoalProgress(currentValue: number, targetValue: number): number {
  return Math.min(Math.round((currentValue / targetValue) * 100), 100);
}

export function getGoalStatus(currentValue: number, targetValue: number, targetDate: Date): GoalStatus {
  if (currentValue >= targetValue) {
    return GoalStatus.Completed;
  }
  if (new Date() > targetDate) {
    return GoalStatus.Abandoned;
  }
  return GoalStatus.Active;
}

export function sortGoalsByProgress(goals: Goal[]): Goal[] {
  return goals.sort((a, b) => {
    const progressA = calculateGoalProgress(a.currentValue, a.targetValue);
    const progressB = calculateGoalProgress(b.currentValue, b.targetValue);
    return progressB - progressA;
  });
}

export function filterGoalsByCategory(goals: Goal[], category: GoalCategory): Goal[] {
  return goals.filter(goal => goal.category === category);
}

export function getUpcomingGoals(goals: Goal[], daysThreshold: number): Goal[] {
  const currentDate = new Date();
  const thresholdDate = new Date(currentDate.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  return goals.filter(goal => 
    goal.status === GoalStatus.Active && 
    goal.targetDate <= thresholdDate &&
    goal.targetDate > currentDate
  );
}

export function generateGoalInsights(goal: GoalWithProgress): string {
  let insight = `You're ${goal.progressPercentage}% towards your goal of ${goal.title}. `;
  
  if (goal.progressPercentage >= 90) {
    insight += "You're almost there! Keep pushing!";
  } else if (goal.progressPercentage >= 50) {
    insight += "Great progress! You're over halfway there.";
  } else if (goal.progressPercentage >= 25) {
    insight += "You're making steady progress. Keep it up!";
  } else {
    insight += "You've taken the first steps. Stay committed to your goal!";
  }

  const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  insight += ` You have ${daysLeft} days left to reach your target.`;

  return insight;
}

export function validateGoalInput(input: GoalCreateInput | GoalUpdateInput): boolean {
  if ('title' in input && (typeof input.title !== 'string' || input.title.length === 0 || input.title.length > 100)) {
    return false;
  }
  if ('description' in input && (typeof input.description !== 'string' || input.description.length > 500)) {
    return false;
  }
  if ('targetDate' in input && !(input.targetDate instanceof Date)) {
    return false;
  }
  if ('targetValue' in input && (typeof input.targetValue !== 'number' || input.targetValue <= 0)) {
    return false;
  }
  if ('currentValue' in input && (typeof input.currentValue !== 'number' || input.currentValue < 0)) {
    return false;
  }
  if ('unit' in input && (typeof input.unit !== 'string' || input.unit.length === 0)) {
    return false;
  }
  if ('category' in input && !Object.values(GoalCategory).includes(input.category)) {
    return false;
  }
  if ('status' in input && !Object.values(GoalStatus).includes(input.status)) {
    return false;
  }
  if ('privacy' in input && !Object.values(GoalPrivacy).includes(input.privacy)) {
    return false;
  }
  return true;
}

export function createGoalReminder(goal: Goal): string {
  const daysUntilTarget = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const progressPercentage = calculateGoalProgress(goal.currentValue, goal.targetValue);

  if (daysUntilTarget <= 0) {
    return `Your goal "${goal.title}" has reached its target date. Update your progress or adjust the goal if needed.`;
  } else if (daysUntilTarget <= 7) {
    return `Only ${daysUntilTarget} days left to reach your goal "${goal.title}". You're ${progressPercentage}% there. Keep pushing!`;
  } else if (progressPercentage >= 90) {
    return `You're so close to achieving your goal "${goal.title}"! Just a little more effort to reach 100%!`;
  } else if (progressPercentage <= 10 && daysUntilTarget <= 30) {
    return `Your goal "${goal.title}" needs attention. You're only ${progressPercentage}% complete with ${daysUntilTarget} days left.`;
  }

  return `Remember your goal: ${goal.title}. You're ${progressPercentage}% there with ${daysUntilTarget} days to go.`;
}
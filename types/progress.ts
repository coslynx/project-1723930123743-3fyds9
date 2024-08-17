import { Goal } from './goal';

export interface Progress {
  id: string;
  goalId: string;
  userId: string;
  value: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressCreateInput {
  goalId: string;
  value: number;
  date: Date;
  notes?: string;
}

export interface ProgressUpdateInput {
  value?: number;
  date?: Date;
  notes?: string;
}

export interface ProgressWithGoal extends Progress {
  goal: Goal;
}

export interface AggregatedProgress {
  goalId: string;
  totalValue: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  entriesCount: number;
  lastUpdated: Date;
}

export type ProgressTrend = 'increasing' | 'decreasing' | 'stable';

export interface ProgressAnalysis {
  goalId: string;
  currentValue: number;
  previousValue: number;
  change: number;
  percentageChange: number;
  trend: ProgressTrend;
}

export interface ProgressChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export function calculateProgressPercentage(currentValue: number, targetValue: number): number {
  return Math.min(Math.round((currentValue / targetValue) * 100), 100);
}

export function analyzeProgressTrend(progressEntries: Progress[]): ProgressTrend {
  if (progressEntries.length < 2) return 'stable';
  const sortedEntries = progressEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
  const recentValues = sortedEntries.slice(-3).map(entry => entry.value);
  const differences = recentValues.slice(1).map((value, index) => value - recentValues[index]);
  const increasingCount = differences.filter(diff => diff > 0).length;
  const decreasingCount = differences.filter(diff => diff < 0).length;
  if (increasingCount > decreasingCount) return 'increasing';
  if (decreasingCount > increasingCount) return 'decreasing';
  return 'stable';
}

export function generateProgressChartData(progressEntries: Progress[]): ProgressChartData {
  const sortedEntries = progressEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
  return {
    labels: sortedEntries.map(entry => entry.date.toLocaleDateString()),
    datasets: [{
      label: 'Progress',
      data: sortedEntries.map(entry => entry.value),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };
}

export function calculateAggregatedProgress(progressEntries: Progress[]): AggregatedProgress {
  if (progressEntries.length === 0) {
    throw new Error('No progress entries provided');
  }
  const goalId = progressEntries[0].goalId;
  const values = progressEntries.map(entry => entry.value);
  return {
    goalId,
    totalValue: values.reduce((sum, value) => sum + value, 0),
    averageValue: values.reduce((sum, value) => sum + value, 0) / values.length,
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
    entriesCount: progressEntries.length,
    lastUpdated: new Date(Math.max(...progressEntries.map(entry => entry.updatedAt.getTime())))
  };
}

export function interpolateProgress(start: Progress, end: Progress, date: Date): number {
  const startTime = start.date.getTime();
  const endTime = end.date.getTime();
  const interpolationTime = date.getTime();
  const timeFraction = (interpolationTime - startTime) / (endTime - startTime);
  return start.value + timeFraction * (end.value - start.value);
}

export function projectFutureProgress(progressEntries: Progress[], daysToProject: number): Progress[] {
  if (progressEntries.length < 2) {
    throw new Error('Insufficient data for projection');
  }
  const sortedEntries = progressEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
  const lastEntry = sortedEntries[sortedEntries.length - 1];
  const averageChangePerDay = calculateAverageChangePerDay(sortedEntries);
  const projectedEntries: Progress[] = [];
  for (let i = 1; i <= daysToProject; i++) {
    const projectedDate = new Date(lastEntry.date.getTime() + i * 24 * 60 * 60 * 1000);
    const projectedValue = lastEntry.value + averageChangePerDay * i;
    projectedEntries.push({
      id: `projected-${i}`,
      goalId: lastEntry.goalId,
      userId: lastEntry.userId,
      value: projectedValue,
      date: projectedDate,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return projectedEntries;
}

function calculateAverageChangePerDay(sortedEntries: Progress[]): number {
  const changes: number[] = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const daysDifference = (sortedEntries[i].date.getTime() - sortedEntries[i-1].date.getTime()) / (24 * 60 * 60 * 1000);
    const valueChange = sortedEntries[i].value - sortedEntries[i-1].value;
    changes.push(valueChange / daysDifference);
  }
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
}

export function validateProgressEntry(entry: ProgressCreateInput): boolean {
  if (!entry.goalId || typeof entry.goalId !== 'string') return false;
  if (typeof entry.value !== 'number' || isNaN(entry.value)) return false;
  if (!(entry.date instanceof Date) || isNaN(entry.date.getTime())) return false;
  if (entry.notes && typeof entry.notes !== 'string') return false;
  return true;
}

export function sortProgressEntries(entries: Progress[], sortBy: 'date' | 'value', order: 'asc' | 'desc'): Progress[] {
  return entries.sort((a, b) => {
    const compareValue = sortBy === 'date' ? a.date.getTime() - b.date.getTime() : a.value - b.value;
    return order === 'asc' ? compareValue : -compareValue;
  });
}
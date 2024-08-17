Here's the complete implementation for the `utils/helpers.ts` file:

```typescript
import { format, parseISO } from 'date-fns';
import { Goal, Progress } from '@/types/user';

export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'MMMM d, yyyy');
};

export const calculateProgress = (goal: Goal, progress: Progress[]): number => {
  if (!progress.length) return 0;
  const latestProgress = progress.reduce((latest, current) => 
    new Date(current.date) > new Date(latest.date) ? current : latest
  );
  return Math.min((latestProgress.value / goal.targetValue) * 100, 100);
};

export const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-yellow-500';
  if (percentage < 75) return 'bg-blue-500';
  return 'bg-green-500';
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
};

export const generateChartData = (progress: Progress[]) => {
  const sortedProgress = progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return {
    labels: sortedProgress.map(p => format(new Date(p.date), 'MMM d')),
    datasets: [{
      label: 'Progress',
      data: sortedProgress.map(p => p.value),
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 0.2)',
    }],
  };
};

export const generateChartOptions = (goal: Goal) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Progress for ${goal.title}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(goal.targetValue, ...goal.Progress.map(p => p.value)),
      },
    },
  };
};

export const calculateStreak = (progress: Progress[]): number => {
  if (!progress.length) return 0;
  const sortedDates = progress
    .map(p => new Date(p.date).toISOString().split('T')[0])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    if (sortedDates[i] === prevDate.toISOString().split('T')[0]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

export const getMotivationalMessage = (streak: number): string => {
  if (streak === 0) return "Start your journey today!";
  if (streak < 3) return "Great start! Keep it up!";
  if (streak < 7) return "You're on a roll!";
  if (streak < 14) return "Impressive dedication!";
  if (streak < 30) return "You're unstoppable!";
  return "You're a true champion!";
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateCaloriesBurned = (
  duration: number,
  weight: number,
  metValue: number
): number => {
  return Math.round((duration / 60) * (metValue * 3.5 * weight) / 200);
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const generateWeeklyReport = (progress: Progress[], goal: Goal): string => {
  const currentWeek = getWeekNumber(new Date());
  const thisWeekProgress = progress.filter(p => getWeekNumber(new Date(p.date)) === currentWeek);
  
  const totalProgress = thisWeekProgress.reduce((sum, p) => sum + p.value, 0);
  const averageProgress = thisWeekProgress.length ? totalProgress / thisWeekProgress.length : 0;
  
  const percentageToGoal = (averageProgress / goal.targetValue) * 100;
  
  let message = `Weekly Report for ${goal.title}:\n`;
  message += `Average progress: ${averageProgress.toFixed(2)}\n`;
  message += `Progress towards goal: ${percentageToGoal.toFixed(2)}%\n`;
  message += `Days logged this week: ${thisWeekProgress.length}\n`;
  
  if (percentageToGoal >= 100) {
    message += "Congratulations! You've reached your goal this week!";
  } else if (percentageToGoal >= 75) {
    message += "Great progress! You're very close to your goal!";
  } else if (percentageToGoal >= 50) {
    message += "Good job! You're making steady progress towards your goal.";
  } else {
    message += "Keep pushing! Every step counts towards your goal.";
  }
  
  return message;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
};

export const generatePasswordStrengthMessage = (password: string): string => {
  const strength = validatePassword(password);
  if (strength) return "Strong password";
  if (password.length >= 8) return "Moderate password - consider adding numbers and special characters";
  return "Weak password - use at least 8 characters with a mix of letters, numbers, and symbols";
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise(resolve => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
};

export const getRandomTip = (): string => {
  const tips = [
    "Stay hydrated! Aim for 8 glasses of water a day.",
    "Take the stairs instead of the elevator for a quick cardio boost.",
    "Incorporate fruits and vegetables into every meal for balanced nutrition.",
    "Take short breaks to stretch during long periods of sitting.",
    "Try meditation or deep breathing exercises to reduce stress.",
    "Aim for 7-9 hours of sleep each night for optimal recovery.",
    "Mix up your workouts to challenge different muscle groups.",
    "Track your meals to become more aware of your eating habits.",
    "Set realistic, achievable goals to maintain motivation.",
    "Celebrate small victories on your fitness journey!"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

export const calculateTotalCaloriesBurned = (progress: Progress[]): number => {
  return progress.reduce((total, p) => total + (p.caloriesBurned || 0), 0);
};

export const generateShareableMessage = (goal: Goal, progress: Progress[]): string => {
  const latestProgress = progress.reduce((latest, current) => 
    new Date(current.date) > new Date(latest.date) ? current : latest
  );
  const progressPercentage = calculateProgress(goal, progress);
  return `I'm ${progressPercentage.toFixed(1)}% towards my goal of ${goal.title} on FitTrack! Join me on my fitness journey!`;
};
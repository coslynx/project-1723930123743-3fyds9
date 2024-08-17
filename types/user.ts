Here's the complete implementation for the `types/user.ts` file:

```typescript
import { Goal } from './goal';
import { Progress } from './progress';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  goals?: Goal[];
  progress?: Progress[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserSignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface UserSignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'goal_achieved' | 'new_comment';
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UserStats {
  totalGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  score: number;
}

export type SocialConnection = {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  connectionType: 'friend' | 'follower' | 'following';
};

export interface UserSettings {
  userId: string;
  notificationsEnabled: boolean;
  privacyLevel: 'public' | 'friends' | 'private';
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'goal_created' | 'goal_completed' | 'progress_updated';
  data: Record<string, any>;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string;
  unlockedAt: Date;
}

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  measurementUnit: 'metric' | 'imperial';
  weekStartDay: 'sunday' | 'monday';
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceToken: string;
  lastUsed: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium' | 'pro';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'cancelled' | 'expired';
}

export interface UserInvitation {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface UserFeedback {
  id: string;
  userId: string;
  content: string;
  category: 'bug' | 'feature_request' | 'general';
  status: 'submitted' | 'in_review' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
}

export interface UserNotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  goalReminders: boolean;
  friendActivityUpdates: boolean;
  weeklyProgressSummary: boolean;
}
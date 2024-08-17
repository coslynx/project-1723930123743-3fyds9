import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, GoalCreateInput, GoalUpdateInput } from '@/types/goal';
import { Progress, ProgressCreateInput } from '@/types/progress';
import { User, UserUpdateInput } from '@/types/user';
import axios from '@/utils/api';
import { toast } from 'react-toastify';

interface FitTrackState {
  user: User | null;
  goals: Goal[];
  selectedGoal: Goal | null;
  progress: Progress[];
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: UserUpdateInput) => Promise<void>;
  fetchGoals: () => Promise<void>;
  createGoal: (goalData: GoalCreateInput) => Promise<void>;
  updateGoal: (goalId: string, goalData: GoalUpdateInput) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  setSelectedGoal: (goal: Goal | null) => void;
  fetchProgress: (goalId: string) => Promise<void>;
  addProgress: (progressData: ProgressCreateInput) => Promise<void>;
  deleteProgress: (progressId: string) => Promise<void>;
}

const useFitTrackStore = create<FitTrackState>(
  persist(
    (set, get) => ({
      user: null,
      goals: [],
      selectedGoal: null,
      progress: [],
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`/api/users/${get().user?.id}`, userData);
          set({ user: response.data, isLoading: false });
          toast.success('Profile updated successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update profile' });
          toast.error('Failed to update profile');
        }
      },

      fetchGoals: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/api/goals?userId=${get().user?.id}`);
          set({ goals: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to fetch goals' });
          toast.error('Failed to load goals');
        }
      },

      createGoal: async (goalData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/goals', goalData);
          set((state) => ({ goals: [...state.goals, response.data], isLoading: false }));
          toast.success('Goal created successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to create goal' });
          toast.error('Failed to create goal');
        }
      },

      updateGoal: async (goalId, goalData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`/api/goals/${goalId}`, goalData);
          set((state) => ({
            goals: state.goals.map((goal) => (goal.id === goalId ? response.data : goal)),
            isLoading: false,
          }));
          toast.success('Goal updated successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update goal' });
          toast.error('Failed to update goal');
        }
      },

      deleteGoal: async (goalId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/api/goals/${goalId}`);
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId),
            isLoading: false,
          }));
          toast.success('Goal deleted successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to delete goal' });
          toast.error('Failed to delete goal');
        }
      },

      setSelectedGoal: (goal) => set({ selectedGoal: goal }),

      fetchProgress: async (goalId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/api/progress?goalId=${goalId}`);
          set({ progress: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to fetch progress' });
          toast.error('Failed to load progress data');
        }
      },

      addProgress: async (progressData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/progress', progressData);
          set((state) => ({
            progress: [...state.progress, response.data],
            isLoading: false,
          }));
          toast.success('Progress added successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to add progress' });
          toast.error('Failed to add progress');
        }
      },

      deleteProgress: async (progressId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/api/progress/${progressId}`);
          set((state) => ({
            progress: state.progress.filter((p) => p.id !== progressId),
            isLoading: false,
          }));
          toast.success('Progress entry deleted successfully');
        } catch (error) {
          set({ isLoading: false, error: 'Failed to delete progress entry' });
          toast.error('Failed to delete progress entry');
        }
      },
    }),
    {
      name: 'fittrack-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useFitTrackStore;
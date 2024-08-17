import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '@/utils/api';
import { Goal, GoalCreateInput, GoalUpdateInput } from '@/types/goal';
import { toast } from 'react-toastify';

export const useGoals = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const {
    data: goals,
    isLoading: isLoadingGoals,
    isError: isErrorGoals,
    error: errorGoals,
  } = useQuery<Goal[], Error>(
    ['goals', session?.user?.id],
    () => axios.get(`/api/goals?userId=${session?.user?.id}`).then((res) => res.data),
    {
      enabled: !!session?.user?.id,
      onError: (error) => {
        console.error('Failed to fetch goals:', error);
        toast.error('Failed to load goals. Please try again.');
      },
    }
  );

  const createGoalMutation = useMutation<Goal, Error, GoalCreateInput>(
    (goalData) => axios.post('/api/goals', goalData).then((res) => res.data),
    {
      onSuccess: (newGoal) => {
        queryClient.setQueryData<Goal[]>(['goals', session?.user?.id], (oldGoals) => 
          oldGoals ? [...oldGoals, newGoal] : [newGoal]
        );
        toast.success('Goal created successfully');
      },
      onError: (error) => {
        console.error('Failed to create goal:', error);
        toast.error('Failed to create goal. Please try again.');
      },
    }
  );

  const updateGoalMutation = useMutation<Goal, Error, GoalUpdateInput & { id: string }>(
    ({ id, ...goalData }) => axios.put(`/api/goals/${id}`, goalData).then((res) => res.data),
    {
      onSuccess: (updatedGoal) => {
        queryClient.setQueryData<Goal[]>(['goals', session?.user?.id], (oldGoals) =>
          oldGoals ? oldGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)) : [updatedGoal]
        );
        toast.success('Goal updated successfully');
        setSelectedGoal(null);
      },
      onError: (error) => {
        console.error('Failed to update goal:', error);
        toast.error('Failed to update goal. Please try again.');
      },
    }
  );

  const deleteGoalMutation = useMutation<void, Error, string>(
    (goalId) => axios.delete(`/api/goals/${goalId}`).then((res) => res.data),
    {
      onSuccess: (_, deletedGoalId) => {
        queryClient.setQueryData<Goal[]>(['goals', session?.user?.id], (oldGoals) =>
          oldGoals ? oldGoals.filter((goal) => goal.id !== deletedGoalId) : []
        );
        toast.success('Goal deleted successfully');
        setSelectedGoal(null);
      },
      onError: (error) => {
        console.error('Failed to delete goal:', error);
        toast.error('Failed to delete goal. Please try again.');
      },
    }
  );

  const createGoal = useCallback((goalData: GoalCreateInput) => {
    createGoalMutation.mutate(goalData);
  }, [createGoalMutation]);

  const updateGoal = useCallback((goalData: GoalUpdateInput & { id: string }) => {
    updateGoalMutation.mutate(goalData);
  }, [updateGoalMutation]);

  const deleteGoal = useCallback((goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  }, [deleteGoalMutation]);

  const selectGoal = useCallback((goal: Goal) => {
    setSelectedGoal(goal);
  }, []);

  const clearSelectedGoal = useCallback(() => {
    setSelectedGoal(null);
  }, []);

  useEffect(() => {
    if (goals && goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  return {
    goals,
    selectedGoal,
    isLoadingGoals,
    isErrorGoals,
    errorGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    selectGoal,
    clearSelectedGoal,
    isCreatingGoal: createGoalMutation.isLoading,
    isUpdatingGoal: updateGoalMutation.isLoading,
    isDeletingGoal: deleteGoalMutation.isLoading,
  };
};
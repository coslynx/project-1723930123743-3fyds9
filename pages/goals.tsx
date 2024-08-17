import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from '@/utils/api';
import { Goal } from '@/types/user';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  targetValue: z.number().min(0, 'Target value must be positive').max(1000000, 'Target value is too large'),
});

type GoalFormData = z.infer<typeof goalSchema>;

const GoalsPage: React.FC = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const { data: goals, isLoading: isLoadingGoals } = useQuery<Goal[]>(
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

  const createGoalMutation = useMutation<Goal, Error, GoalFormData>(
    (goalData) => axios.post('/api/goals', goalData).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals', session?.user?.id]);
        toast.success('Goal created successfully');
        reset();
      },
      onError: (error) => {
        console.error('Failed to create goal:', error);
        toast.error('Failed to create goal. Please try again.');
      },
    }
  );

  const updateGoalMutation = useMutation<Goal, Error, GoalFormData & { id: string }>(
    (goalData) => axios.put(`/api/goals/${goalData.id}`, goalData).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals', session?.user?.id]);
        toast.success('Goal updated successfully');
        setIsEditing(false);
        setSelectedGoal(null);
        reset();
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
      onSuccess: () => {
        queryClient.invalidateQueries(['goals', session?.user?.id]);
        toast.success('Goal deleted successfully');
        setSelectedGoal(null);
      },
      onError: (error) => {
        console.error('Failed to delete goal:', error);
        toast.error('Failed to delete goal. Please try again.');
      },
    }
  );

  useEffect(() => {
    if (selectedGoal) {
      setValue('title', selectedGoal.title);
      setValue('description', selectedGoal.description || '');
      setValue('targetDate', format(new Date(selectedGoal.targetDate), 'yyyy-MM-dd'));
      setValue('targetValue', selectedGoal.targetValue);
    }
  }, [selectedGoal, setValue]);

  const onSubmit = (data: GoalFormData) => {
    if (isEditing && selectedGoal) {
      updateGoalMutation.mutate({ ...data, id: selectedGoal.id });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditing(true);
  };

  const handleDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedGoal(null);
    reset();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-fittrack-background flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Please sign in to view and manage your goals.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fittrack-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-fittrack-primary mb-6">
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8 bg-white shadow-md rounded-lg p-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
            />
            {errors.title && <p className="mt-1 text-sm text-fittrack-error">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-fittrack-error">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">Target Date</label>
            <input
              type="date"
              id="targetDate"
              {...register('targetDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
            />
            {errors.targetDate && <p className="mt-1 text-sm text-fittrack-error">{errors.targetDate.message}</p>}
          </div>

          <div>
            <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700">Target Value</label>
            <input
              type="number"
              id="targetValue"
              {...register('targetValue', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
            />
            {errors.targetValue && <p className="mt-1 text-sm text-fittrack-error">{errors.targetValue.message}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fittrack-primary"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fittrack-primary hover:bg-fittrack-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fittrack-primary"
              disabled={createGoalMutation.isLoading || updateGoalMutation.isLoading}
            >
              {isEditing ? (updateGoalMutation.isLoading ? 'Updating...' : 'Update Goal') : (createGoalMutation.isLoading ? 'Creating...' : 'Create Goal')}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-fittrack-primary mb-4">Your Goals</h2>
          {isLoadingGoals ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fittrack-primary"></div>
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                  <p className="text-gray-600 mt-2">{goal.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Target Date: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">Target Value: {goal.targetValue}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fittrack-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fittrack-error hover:bg-fittrack-error-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fittrack-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">You haven't set any goals yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GoalsPage;
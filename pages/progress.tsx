import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '@/utils/api';
import { Goal, Progress } from '@/types/user';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const progressSchema = z.object({
  value: z.number().min(0, 'Value must be positive').max(1000000, 'Value is too large'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
});

type ProgressFormData = z.infer<typeof progressSchema>;

const ProgressPage: React.FC = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

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

  const { data: progress, isLoading: isLoadingProgress } = useQuery<Progress[]>(
    ['progress', selectedGoal],
    () => axios.get(`/api/progress?goalId=${selectedGoal}`).then((res) => res.data),
    {
      enabled: !!selectedGoal,
      onError: (error) => {
        console.error('Failed to fetch progress:', error);
        toast.error('Failed to load progress data. Please try again.');
      },
    }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  const addProgressMutation = useMutation(
    (progressData: ProgressFormData) => axios.post('/api/progress', { ...progressData, goalId: selectedGoal }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['progress', selectedGoal]);
        toast.success('Progress added successfully');
        reset();
      },
      onError: (error) => {
        console.error('Failed to add progress:', error);
        toast.error('Failed to add progress. Please try again.');
      },
    }
  );

  const onSubmit = (data: ProgressFormData) => {
    addProgressMutation.mutate(data);
  };

  const chartData = {
    labels: progress?.map((p) => format(new Date(p.date), 'MMM d')) || [],
    datasets: [
      {
        label: 'Progress',
        data: progress?.map((p) => p.value) || [],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Progress Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    if (goals && goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0].id);
    }
  }, [goals, selectedGoal]);

  if (isLoadingGoals) {
    return (
      <div className="min-h-screen bg-fittrack-background flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-fittrack-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fittrack-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-fittrack-primary mb-6">Progress Tracker</h1>

        <div className="mb-6">
          <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700 mb-2">Select Goal</label>
          <select
            id="goalSelect"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
            onChange={(e) => setSelectedGoal(e.target.value)}
            value={selectedGoal || ''}
          >
            <option value="">Select a goal</option>
            {goals?.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>

        {selectedGoal && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-white shadow-md rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">Progress Value</label>
                  <input
                    type="number"
                    id="value"
                    {...register('value', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
                  />
                  {errors.value && <p className="mt-1 text-sm text-fittrack-error">{errors.value.message}</p>}
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    id="date"
                    {...register('date')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
                  />
                  {errors.date && <p className="mt-1 text-sm text-fittrack-error">{errors.date.message}</p>}
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-fittrack-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={addProgressMutation.isLoading}
              >
                {addProgressMutation.isLoading ? 'Adding...' : 'Add Progress'}
              </button>
            </form>

            {isLoadingProgress ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-fittrack-primary"></div>
              </div>
            ) : progress && progress.length > 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-600 mb-8">No progress data available for this goal.</p>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-fittrack-primary mb-4">Progress History</h2>
              {progress && progress.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {progress.map((p) => (
                        <tr key={p.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(p.date), 'MMMM d, yyyy')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600">No progress entries yet.</p>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProgressPage;
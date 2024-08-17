import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from 'react-query';
import axios from '@/utils/api';
import { Goal, Progress } from '@/types/user';
import { format } from 'date-fns';
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
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
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

  useEffect(() => {
    if (goals && goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0].id);
    }
  }, [goals, selectedGoal]);

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

  if (status === 'loading' || isLoadingGoals) {
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

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-fittrack-background flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-fittrack-primary mb-4">Welcome to FitTrack</h1>
            <p className="mb-4">Please sign in to view your dashboard and track your fitness goals.</p>
            <Link href="/auth/signin" className="bg-fittrack-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
              Sign In
            </Link>
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
        <h1 className="text-3xl font-bold text-fittrack-primary mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
            {goals && goals.length > 0 ? (
              <ul className="space-y-2">
                {goals.map((goal) => (
                  <li key={goal.id} className="flex justify-between items-center">
                    <span>{goal.title}</span>
                    <span className="text-sm text-gray-500">
                      Target: {goal.targetValue} by {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">You haven't set any goals yet.</p>
            )}
            <Link href="/goals" className="mt-4 inline-block bg-fittrack-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
              Manage Goals
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Progress</h2>
            {selectedGoal && progress && progress.length > 0 ? (
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-gray-600">No recent progress data available.</p>
            )}
            <Link href="/progress" className="mt-4 inline-block bg-fittrack-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
              Track Progress
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
          {selectedGoal && goals ? (
            <div>
              <select
                className="mb-4 w-full p-2 border border-gray-300 rounded-md"
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
              >
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              {goals.find((goal) => goal.id === selectedGoal) && (
                <div>
                  <h3 className="font-semibold">{goals.find((goal) => goal.id === selectedGoal)?.title}</h3>
                  <p className="text-gray-600 mb-2">{goals.find((goal) => goal.id === selectedGoal)?.description}</p>
                  <p className="text-sm text-gray-500">
                    Target: {goals.find((goal) => goal.id === selectedGoal)?.targetValue} by{' '}
                    {format(new Date(goals.find((goal) => goal.id === selectedGoal)?.targetDate || ''), 'MMMM d, yyyy')}
                  </p>
                  {progress && progress.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Latest Progress:</h4>
                      <p>
                        {progress[progress.length - 1].value} on{' '}
                        {format(new Date(progress[progress.length - 1].date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Select a goal to view details.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
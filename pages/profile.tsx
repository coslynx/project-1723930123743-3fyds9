import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from '@/utils/api';
import { User, Goal } from '@/types/user';
import { format } from 'date-fns';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  bio: z.string().max(250, 'Bio must be less than 250 characters'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const { data: user, isLoading, isError } = useQuery<User>(
    ['user', session?.user?.id],
    () => axios.get(`/api/users/${session?.user?.id}`).then((res) => res.data),
    {
      enabled: !!session?.user?.id,
      retry: 3,
      onError: (error) => {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load user profile. Please try again later.');
      },
    }
  );

  const { data: goals } = useQuery<Goal[]>(
    ['goals', session?.user?.id],
    () => axios.get(`/api/goals?userId=${session?.user?.id}`).then((res) => res.data),
    {
      enabled: !!session?.user?.id,
      retry: 3,
      onError: (error) => {
        console.error('Failed to fetch goals:', error);
        toast.error('Failed to load goals. Please try again later.');
      },
    }
  );

  const updateUserMutation = useMutation<User, Error, UserProfileFormData>(
    (userData) => axios.put(`/api/users/${session?.user?.id}`, userData).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', session?.user?.id]);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update profile:', error);
        toast.error('Failed to update profile. Please try again.');
      },
    }
  );

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('bio', user.bio || '');
      setValue('avatarUrl', user.avatarUrl || '');
    }
  }, [user, setValue]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-fittrack-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-fittrack-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || isError) {
    router.push('/auth/signin');
    return null;
  }

  const onSubmit = (data: UserProfileFormData) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-fittrack-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-fittrack-primary">User Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-fittrack-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
                />
                {errors.name && <p className="mt-1 text-sm text-fittrack-error">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  {...register('bio')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
                ></textarea>
                {errors.bio && <p className="mt-1 text-sm text-fittrack-error">{errors.bio.message}</p>}
              </div>

              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input
                  type="text"
                  id="avatarUrl"
                  {...register('avatarUrl')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
                />
                {errors.avatarUrl && <p className="mt-1 text-sm text-fittrack-error">{errors.avatarUrl.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-fittrack-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                disabled={updateUserMutation.isLoading}
              >
                {updateUserMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={user?.avatarUrl || '/default-avatar.png'}
                  alt={user?.name || 'User'}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-semibold">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <p className="text-gray-700">{user?.bio || 'No bio provided'}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-fittrack-primary mb-4">Your Goals</h2>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border-b pb-4">
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                  <p className="text-gray-600">{goal.description}</p>
                  <p className="text-sm text-gray-500">
                    Target Date: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">Target Value: {goal.targetValue}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-fittrack-primary h-2.5 rounded-full" style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Progress: {goal.currentValue} / {goal.targetValue}</p>
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

export default Profile;
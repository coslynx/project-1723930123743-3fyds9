import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '@/utils/api';
import { User, Post } from '@/types/user';
import { format } from 'date-fns';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(280, 'Post content must be less than 280 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

const Social: React.FC = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const { data: posts, isLoading, isError, error } = useQuery<Post[]>(
    ['posts', page],
    () => axios.get(`/api/posts?page=${page}&limit=10`).then((res) => res.data),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        if (data.length < 10) {
          setHasMore(false);
        }
      },
    }
  );

  const createPostMutation = useMutation(
    (postData: PostFormData) => axios.post('/api/posts', postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
        toast.success('Post created successfully');
        reset();
      },
      onError: () => {
        toast.error('Failed to create post');
      },
    }
  );

  const likePostMutation = useMutation(
    (postId: string) => axios.post(`/api/posts/${postId}/like`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
      },
      onError: () => {
        toast.error('Failed to like post');
      },
    }
  );

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="min-h-screen bg-fittrack-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-fittrack-primary mb-6">Social Feed</h1>

        {session && (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">What's on your mind?</label>
              <textarea
                id="content"
                {...register('content')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fittrack-primary focus:ring focus:ring-fittrack-primary focus:ring-opacity-50"
              />
              {errors.content && <p className="mt-1 text-sm text-fittrack-error">{errors.content.message}</p>}
            </div>
            <button
              type="submit"
              className="bg-fittrack-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createPostMutation.isLoading}
            >
              {createPostMutation.isLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        {isLoading && <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fittrack-primary"></div>
        </div>}

        {isError && <div className="text-center text-fittrack-error">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>}

        <div className="space-y-6">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Image
                  src={post.author.avatarUrl || '/default-avatar.png'}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-4"
                />
                <div>
                  <h2 className="font-semibold">{post.author.name}</h2>
                  <p className="text-sm text-gray-500">{format(new Date(post.createdAt), 'PPpp')}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center text-fittrack-secondary hover:text-fittrack-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={likePostMutation.isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                </button>
                <span className="text-sm text-gray-500">{post.comments} {post.comments === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="bg-fittrack-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Social;
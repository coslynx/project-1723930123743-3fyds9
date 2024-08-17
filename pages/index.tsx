import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-fittrack-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-fittrack-primary mb-4">Welcome to FitTrack</h1>
          <p className="text-xl text-gray-600">Your personal fitness journey companion</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-fittrack-secondary mb-4">Set Your Goals</h2>
            <p className="text-gray-600 mb-4">Create personalized fitness goals and track your progress over time.</p>
            {session ? (
              <Link href="/goals" className="inline-block bg-fittrack-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Set Goals
              </Link>
            ) : (
              <Link href="/auth/signin" className="inline-block bg-fittrack-secondary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Sign In to Set Goals
              </Link>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-fittrack-secondary mb-4">Track Your Progress</h2>
            <p className="text-gray-600 mb-4">Log your workouts, monitor your achievements, and visualize your fitness journey.</p>
            {session ? (
              <Link href="/progress" className="inline-block bg-fittrack-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                View Progress
              </Link>
            ) : (
              <Link href="/auth/signin" className="inline-block bg-fittrack-secondary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Sign In to Track Progress
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-fittrack-primary mb-6">Why Choose FitTrack?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="bg-white rounded-full p-4 inline-block mb-4">
                <Image src="/icons/goal.svg" alt="Goal Setting" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Goals</h3>
              <p className="text-gray-600">Set custom fitness goals tailored to your needs and aspirations.</p>
            </div>
            <div>
              <div className="bg-white rounded-full p-4 inline-block mb-4">
                <Image src="/icons/chart.svg" alt="Progress Tracking" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Visualize your progress with intuitive charts and graphs.</p>
            </div>
            <div>
              <div className="bg-white rounded-full p-4 inline-block mb-4">
                <Image src="/icons/community.svg" alt="Community" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Supportive Community</h3>
              <p className="text-gray-600">Connect with like-minded individuals and share your fitness journey.</p>
            </div>
          </div>
        </div>

        {!session && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-fittrack-primary mb-4">Ready to Start Your Fitness Journey?</h2>
            <Link href="/auth/signin" className="inline-block bg-fittrack-primary text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-opacity-90 transition-colors">
              Get Started Now
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
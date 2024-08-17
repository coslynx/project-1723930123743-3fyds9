import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="bg-fittrack-primary text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="FitTrack Logo" width={40} height={40} className="mr-2" />
          <span className="text-2xl font-bold">FitTrack</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-fittrack-accent transition-colors">
                Home
              </Link>
            </li>
            {status === 'authenticated' ? (
              <>
                <li>
                  <Link href="/dashboard" className="hover:text-fittrack-accent transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/goals" className="hover:text-fittrack-accent transition-colors">
                    Goals
                  </Link>
                </li>
                <li>
                  <Link href="/progress" className="hover:text-fittrack-accent transition-colors">
                    Progress
                  </Link>
                </li>
                <li>
                  <Link href="/social" className="hover:text-fittrack-accent transition-colors">
                    Social
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="bg-fittrack-secondary hover:bg-fittrack-accent text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/auth/signin"
                  className="bg-fittrack-secondary hover:bg-fittrack-accent text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
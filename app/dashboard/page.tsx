'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
export default function DashboardPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        redirect('/api/auth/signin');
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {session?.user && (
                <div className="space-y-2">
                    <p>Welcome, {session.user.name}!</p>
                    <p>Email: {session.user.email}</p>
                    {session.user.image && (
                        <img
                            src={session.user.image}
                            alt="Profile"
                            className="w-16 h-16 rounded-full"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
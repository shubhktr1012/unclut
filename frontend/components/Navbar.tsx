"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
    name: string;
    email: string;
    picture: string;
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);

    const [loginUrl, setLoginUrl] = useState("https://unclut-backend.onrender.com/auth/login");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Determine API URL
                const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

                // Update Login URL based on environment
                setLoginUrl(`${API_BASE_URL}/auth/login`);

                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (e) {
                // Determine if this is a real error or just "not logged in" network noise
                console.warn("User not logged in or backend unreachable (this is normal if signed out).");
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const isLocal = typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
            const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

            await fetch(`${API_BASE_URL}/auth/logout`, { credentials: 'include' });
            setUser(null);
            window.location.href = '/'; // Refresh page
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <nav className="w-full py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    U
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">unClut.ai</span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
                <Link href="#" className="hover:text-teal-600 transition-colors">Features</Link>
                <Link href="#" className="hover:text-teal-600 transition-colors">About</Link>
            </div>

            {user ? (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {user.picture && <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />}
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <a
                    href={loginUrl}
                    className="px-4 py-2 text-sm font-medium text-teal-600 border border-teal-100 rounded-full hover:bg-teal-50 transition-colors"
                >
                    Sign In with Google
                </a>
            )}
        </nav>
    );
}

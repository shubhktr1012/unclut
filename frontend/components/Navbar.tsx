"use client";
import Link from 'next/link';
import { useState } from 'react';

interface User {
    name: string;
    email: string;
    picture: string;
}

export interface NavbarProps {
    user: User | null;
    onLogout: () => void;
    loginUrl: string;
    onShowOnboarding: () => void;
}

export default function Navbar({ user, onLogout, loginUrl, onShowOnboarding }: NavbarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className="w-full py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    U
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">unClut.ai</span>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
                <Link href="#" className="hover:text-teal-600 transition-colors">Features</Link>
                <Link href="#" className="hover:text-teal-600 transition-colors">About</Link>
            </div>

            {user ? (
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full pr-3 transition-colors outline-none focus:ring-2 focus:ring-teal-100"
                    >
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                        ) : (
                            <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            {/* Backdrop to close on click outside */}
                            <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setIsDropdownOpen(false)}
                            />

                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Signed in as</p>
                                    <p className="text-sm text-gray-900 truncate font-medium">{user.email}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        onShowOnboarding();
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Onboarding Guide
                                </button>

                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        onLogout();
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
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

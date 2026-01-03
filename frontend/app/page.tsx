"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EmailList from "../components/EmailList";
import OnboardingWizard from "../components/OnboardingWizard";

interface User {
  name: string;
  email: string;
  picture: string;
  hasOnboarded?: boolean;
  unsubs_count?: number;
  deleted_count?: number;
}

export default function Home() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginUrl, setLoginUrl] = useState("https://unclut-backend.onrender.com/auth/login");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchUserStats = async () => {
    try {
      // Determine API URL (Redundant check but safe)
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      }
    } catch (e) {
      console.warn("Failed to fetch user stats", e);
    }
    return null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Determine API URL
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

        // Update Login URL based on environment
        setLoginUrl(`${API_BASE_URL}/auth/login`);

        const data = await fetchUserStats();

        // Show onboarding if user exists but has NOT onboarded
        if (data && !data.hasOnboarded) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.warn("User not logged in or backend unreachable");
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

      await fetch(`${API_BASE_URL}/auth/logout`, { credentials: 'include' });
      setUser(null);
      window.location.href = '/'; // Refresh page
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

      const res = await fetch(`${API_BASE_URL}/auth/onboarded`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        setShowOnboarding(false);
        // Update local state so it doesn't pop up again in this session if we did something weird
        if (user) {
          setUser({ ...user, hasOnboarded: true });
        }
      }
    } catch (e) {
      console.error("Failed to mark onboarding complete", e);
      // Close anyway to not block user
      setShowOnboarding(false);
    }
  };

  const scanInbox = async () => {
    setLoading(true);
    try {
      // Use localhost for development, or prod url
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

      const res = await fetch(`${API_BASE_URL}/scan?max_senders=10`, {
        // We must include credentials (cookies) for the session to work!
        credentials: 'include'
      });

      if (res.status === 401) {
        alert("Please sign in first!");
        return;
      }

      const data = await res.json();
      setEmails(data.emails);

      // Also refresh stats just in case
      fetchUserStats();

    } catch (error) {
      console.error("Failed to fetch emails:", error);
      alert("Error connecting to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar
        user={user}
        onLogout={handleLogout}
        loginUrl={loginUrl}
        onShowOnboarding={() => setShowOnboarding(true)}
      />
      <Hero
        onScan={scanInbox}
        loading={loading}
        isLoggedIn={!!user}
        loginUrl={loginUrl}
        user={user}
      />
      <EmailList
        emails={emails}
        onRefill={scanInbox}
        onUpdateStats={fetchUserStats}
      />
      <OnboardingWizard isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </main>
  );
}
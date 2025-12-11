"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EmailList from "../components/EmailList";

export default function Home() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      alert("Error connecting to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <Hero onScan={scanInbox} loading={loading} />
      <EmailList emails={emails} onRefill={scanInbox} />
    </main>
  );
}
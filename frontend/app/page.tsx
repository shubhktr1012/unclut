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
      // This calls your Python Backend
      const res = await fetch("https://unclut-backend.onrender.com/scan?max_senders=10");
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
      <EmailList emails={emails} />
    </main>
  );
}
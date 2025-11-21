"use client";
import { useState } from "react";

export default function Home() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scanInbox = async () => {
    setLoading(true);
    try {
      // This calls your Python Backend
      const res = await fetch("https://unclut-backend.onrender.com/scan?max_senders=10");
      const data = await res.json();
      setEmails(data.emails); // Assuming your backend returns { emails: [...] }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      alert("Error connecting to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600">unClut.ai</h1>
          <button
            onClick={scanInbox}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan My Inbox"}
          </button>
        </header>

        <div className="grid gap-4">
          {emails.length === 0 && !loading && (
            <p className="text-gray-500 text-center mt-10">
              Click "Scan My Inbox" to find promotional emails.
            </p>
          )}

          {emails.map((email: any) => (
            <div key={email.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{email.sender_display}</h3>
                  <p className="text-gray-600 text-sm">{email.sender_email}</p>
                </div>
                <span className="text-xs text-gray-400">{email.payload.headers.find((h: any) => h.name === 'Date')?.value}</span>
              </div>
              <p className="mt-2 text-gray-800 font-medium truncate">
                {email.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
import { useState } from 'react';

interface Email {
    id: string;
    sender_email: string;
    sender_display: string;
    snippet: string;
    payload: {
        headers: { name: string; value: string }[];
    };
}

interface EmailListProps {
    emails: Email[];
}

export default function EmailList({ emails: initialEmails }: EmailListProps) {
    const [emails, setEmails] = useState<Email[]>(initialEmails);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);

    // Sync state if props change (optional, but good for fresh scans)
    if (initialEmails.length !== emails.length && emails.length === 0 && initialEmails.length > 0) {
        setEmails(initialEmails);
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const toggleAll = () => {
        if (selected.size === emails.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(emails.map(e => e.id)));
        }
    };

    const getSelectedSenders = () => {
        const senders = new Set<string>();
        emails.forEach(email => {
            if (selected.has(email.id)) {
                senders.add(email.sender_email);
            }
        });
        return Array.from(senders);
    }

    const handleAction = async (action: 'unsubscribe' | 'delete' | 'both') => {
        const senders = getSelectedSenders();
        if (senders.length === 0) return;

        setProcessing(true);
        const endpointMap = {
            'unsubscribe': '/unsubscribe',
            'delete': '/delete',
            'both': '/unsubscribe_and_delete'
        };

        // Use localhost for development, or an environment variable in production
        // Use localhost for development, or an environment variable in production
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://unclut-backend.onrender.com';

        const endpoint = `${API_BASE_URL}${endpointMap[action]}`;

        // We process sequentially for now to avoid blasting the backend
        let successCount = 0;
        let failCount = 0;

        for (const sender of senders) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // <--- IMPORTANT: Send session cookie
                    body: JSON.stringify({ sender_email: sender })
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                    let err;
                    try {
                        err = await res.json();
                    } catch (e) {
                        err = await res.text();
                    }
                    console.error(`Failed to ${action} ${sender} (${res.status} ${res.statusText}):`, err);
                }
            } catch (error) {
                failCount++;
                console.error(`Error connecting for ${sender}:`, error);
            }
        }

        // If 'delete' or 'both', remove from UI locally
        if (action === 'delete' || action === 'both') {
            const newEmails = emails.filter(e => !selected.has(e.id));
            setEmails(newEmails);
            setSelected(new Set()); // Clear selection
        }

        setProcessing(false);
        alert(`Action completed. Success: ${successCount}, Failed: ${failCount}`);
    };

    if (emails.length === 0) return null;

    return (
        <section className="w-full max-w-4xl mx-auto px-4 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header / Actions Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selected.size === emails.length && emails.length > 0}
                            onChange={toggleAll}
                            className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {selected.size} selected
                        </span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                            disabled={selected.size === 0 || processing}
                            onClick={() => handleAction('delete')}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                            Delete
                        </button>
                        <button
                            disabled={selected.size === 0 || processing}
                            onClick={() => handleAction('unsubscribe')}
                            className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                            Unsubscribe
                        </button>
                        <button
                            disabled={selected.size === 0 || processing}
                            onClick={() => handleAction('both')}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
                        >
                            Unsubscribe & Delete
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100">
                    {processing && (
                        <div className="p-4 text-center text-teal-600 bg-teal-50 text-sm animate-pulse">
                            Processing your request... please do not close this tab.
                        </div>
                    )}
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start ${selected.has(email.id) ? 'bg-teal-50/30' : ''
                                }`}
                        >
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    checked={selected.has(email.id)}
                                    onChange={() => toggleSelection(email.id)}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate pr-4">
                                        {email.sender_display || email.sender_email}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {email.payload.headers.find((h) => h.name === 'Date')?.value}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mb-1">
                                    {email.sender_email}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {email.snippet}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

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

export default function EmailList({ emails }: EmailListProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

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

    if (emails.length === 0) return null;

    return (
        <section className="w-full max-w-4xl mx-auto px-4 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header / Actions Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
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
                    <div className="flex gap-2">
                        <button
                            disabled={selected.size === 0}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            disabled={selected.size === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Unsubscribe
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100">
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

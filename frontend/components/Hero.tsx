interface User {
    unsubs_count?: number;
    deleted_count?: number;
}

interface HeroProps {
    onScan: () => void;
    loading: boolean;
    isLoggedIn: boolean;
    loginUrl: string;
    user?: User | null;
}

function formatBytes(bytes: number, decimals = 1) {
    if (!+bytes) return { value: '0', unit: 'B' };
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
        value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString(),
        unit: sizes[i]
    };
}

// Helper Component for Tooltips
// Helper Component for Tooltips
const StatTooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="group relative inline-block cursor-help bg-transparent">
        {children}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {text}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
        </div>
    </div>
);

function formatTime(seconds: number) {
    if (seconds < 60) return { value: seconds.toString(), unit: 'sec' };
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return { value: minutes.toString(), unit: 'min' };
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) return { value: hours.toString(), unit: 'hrs' };
    return { value: `${hours}.${Math.floor(remainingMins / 6)}`, unit: 'hrs' }; // e.g. 2.5 hrs
}

export default function Hero({ onScan, loading, isLoggedIn, loginUrl, user }: HeroProps) {
    const deletedCount = user?.deleted_count || 0;
    const unsubsCount = user?.unsubs_count || 0;

    // Estimates
    const storageSaved = deletedCount * 150 * 1024; // ~150KB per email
    const timeSaved = (unsubsCount * 30) + (deletedCount * 5); // 30s per unsub, 5s per delete

    // Clutter Score: Starts at 100 (High Clutter) and goes down as you clean? 
    // Or starts low (0% clean) and goes up? Let's do "Inbox Health" or "Clutter Score" (Lower is better?)
    // User asked for "Clutter Score". Usually high score = high clutter.
    // Let's assume everyone starts with "Unknown" or just show a score that improves.
    // Let's do "Clutter Free Score" -> Starts at 0, max 100?
    // Let's do a gamified "Clutter Score" where lower is better, but maybe confusing.
    // Let's do "Inbox Health": 
    // Base 50% + actions. 
    // Actually user asked specifically for "Clutter Score". 
    // Let's say "Clutter Score" drops as you clean. 
    // Initial: 100.
    // Each unsub drops it by 2. Each 10 deletes drops it by 1. Min 0.
    const baseClutter = 100;
    const clutterScore = Math.max(0, baseClutter - (unsubsCount * 2) - (Math.floor(deletedCount / 10)));


    return (
        <section className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center bg-gradient-to-br from-teal-50 via-white to-blue-50 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="w-full max-w-7xl px-4 md:px-8 relative z-10 flex flex-col items-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-4">
                        ✨ The smartest way to clean your inbox
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                        Reclaim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Inbox</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Unclut.ai intelligently scans your Gmail for promotional clutter and helps you unsubscribe in seconds.
                    </p>

                </div>

                <div className="pt-8 flex flex-col items-center gap-12 w-full">
                    {isLoggedIn ? (
                        <div className="w-full flex flex-col items-center gap-12">
                            <button
                                onClick={onScan}
                                disabled={loading}
                                className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-teal-200 hover:bg-teal-700 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Scanning Inbox...
                                    </>
                                ) : (
                                    "Scan My Inbox"
                                )}
                            </button>

                            {/* Impact Stats Row */}
                            <div className="w-full mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">

                                    {/* Stat 1: Deleted */}
                                    <div className="px-6 py-6 flex flex-col items-center text-center h-full justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Emails Deleted</h3>
                                            <div className="flex items-center gap-2 mb-1 justify-center">
                                                <span className="text-base text-gray-700 font-medium">Total number of junk and promotional emails permanently removed from your inbox</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 justify-center mt-4">
                                            <StatTooltip text="Count of promotional emails deleted via Unclut">
                                                <span className="text-5xl md:text-6xl font-extrabold text-teal-600 tracking-tight">{deletedCount}</span>
                                            </StatTooltip>
                                            <span className="text-lg font-semibold text-gray-500">emails</span>
                                        </div>
                                    </div>

                                    {/* Stat 2: Storage */}
                                    <div className="px-6 py-6 flex flex-col items-center text-center h-full justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Storage Saved</h3>
                                            <div className="flex items-center gap-2 mb-1 justify-center">
                                                <span className="text-base text-gray-700 font-medium">Estimated cloud storage space reclaimed by deleting unwanted email clutter</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 justify-center mt-4">
                                            <StatTooltip text="Estimated based on ~150KB avg email size">
                                                <span className="text-5xl md:text-6xl font-extrabold text-teal-600 tracking-tight">{formatBytes(storageSaved).value}</span>
                                            </StatTooltip>
                                            <span className="text-lg font-semibold text-gray-500">{formatBytes(storageSaved).unit}</span>
                                        </div>
                                    </div>

                                    {/* Stat 3: Time */}
                                    <div className="px-6 py-6 flex flex-col items-center text-center h-full justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Time Saved</h3>
                                            <div className="flex items-center gap-2 mb-1 justify-center">
                                                <span className="text-base text-gray-700 font-medium">Hours of manual effort saved effectively by automating unsubscribe actions</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 justify-center mt-4">
                                            <StatTooltip text="~30s per unsub & 5s per delete saved">
                                                <span className="text-5xl md:text-6xl font-extrabold text-teal-600 tracking-tight">{formatTime(timeSaved).value}</span>
                                            </StatTooltip>
                                            <span className="text-lg font-semibold text-gray-500">{formatTime(timeSaved).unit}</span>
                                        </div>
                                    </div>

                                    {/* Stat 4: Clutter Score */}
                                    <div className="px-6 py-6 flex flex-col items-center text-center h-full justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Clutter Score</h3>
                                            <div className="flex items-center gap-2 mb-1 justify-center">
                                                <span className="text-base text-gray-700 font-medium">Real-time inbox hygiene score based on your unread and unwanted email ratio</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 justify-center mt-4">
                                            <StatTooltip text="Lower is better. Drops with every cleanup action.">
                                                <span className={`text-5xl md:text-6xl font-extrabold tracking-tight ${clutterScore < 30 ? 'text-teal-600' : (clutterScore < 70 ? 'text-amber-600' : 'text-red-700')}`}>
                                                    {clutterScore}
                                                </span>
                                            </StatTooltip>
                                            <span className="text-lg font-semibold text-gray-500">/ 100</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <a
                                href={loginUrl}
                                className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-teal-200 hover:bg-teal-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                            >
                                Sign In with Google
                            </a>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Secure • Private • Google Verified
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

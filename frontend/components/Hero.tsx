interface HeroProps {
    onScan: () => void;
    loading: boolean;
}

export default function Hero({ onScan, loading }: HeroProps) {
    return (
        <section className="w-full min-h-[85vh] flex flex-col justify-center items-center text-center bg-gradient-to-br from-teal-50 via-white to-blue-50 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="max-w-4xl space-y-8 px-8 relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-4">
                    ✨ The smartest way to clean your inbox
                </div>

                <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                    Reclaim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Inbox</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Unclut.ai intelligently scans your Gmail for promotional clutter and helps you unsubscribe in seconds.
                </p>

                <div className="pt-8 flex flex-col items-center gap-4">
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
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Secure • Private • Google Verified
                    </p>
                </div>
            </div>
        </section>
    );
}

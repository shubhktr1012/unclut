import Link from 'next/link';

export default function Navbar() {
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
            <button className="px-4 py-2 text-sm font-medium text-teal-600 border border-teal-100 rounded-full hover:bg-teal-50 transition-colors">
                Sign In
            </button>
        </nav>
    );
}

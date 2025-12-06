import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-8 text-center text-sm text-gray-500 border-t border-gray-100 bg-white">
            <p className="mb-2">Developed by <span className="font-semibold text-gray-800">Shubh Khatri</span></p>
            <div className="flex justify-center gap-6">
                <Link href="https://github.com/shubhktr1012/unclut" className="hover:text-teal-600 transition-colors">GitHub</Link>
                <Link href="www.linkedin.com/in/shubhkhatri1209" className="hover:text-teal-600 transition-colors">LinkedIn</Link>
                <Link href="https://www.instagram.com/shubh_khatri10/?hl=en" className="hover:text-teal-600 transition-colors">Instagram</Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} unClut.ai</p>
        </footer>
    );
}

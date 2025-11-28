export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 p-6 mt-12">
            <div className="container mx-auto text-center">
                {/* 현재 연도를 자동으로 표시하는 저작권 표시 */}
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Geurim Lab. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
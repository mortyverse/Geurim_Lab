export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 p-6 mt-12">
            <div className="container mx-auto text-center">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Geurim Lab. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
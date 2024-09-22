export default function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Forbidden</h1>
            <p className="text-lg text-gray-700">You do not have permission to view this page.</p>
        </div>
    );
}
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <p className="mb-4 text-2xl font-semibold text-gray-700">
          Page Not Found
        </p>
        <p className="mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="font-medium underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

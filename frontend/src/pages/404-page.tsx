import { Home } from 'lucide-react';
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>404</h1>
        <p className='text-2xl font-semibold text-gray-700 mb-4'>
          Page Not Found
        </p>
        <p className='text-gray-600 mb-8'>
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to='/'
          className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
        >
          <Home className='mr-2 h-5 w-5' />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

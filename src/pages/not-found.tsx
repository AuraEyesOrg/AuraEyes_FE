import { Link } from 'react-router-dom';

/**
 * NotFoundPage - 404 error page
 */
const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="mt-4 text-2xl text-neutral">Page Not Found</p>
        <p className="mt-2 text-neutral">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

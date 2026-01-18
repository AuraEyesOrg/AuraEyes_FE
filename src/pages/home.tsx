import { Link } from 'react-router-dom';

/**
 * HomePage - Landing page for unauthenticated users
 */
const HomePage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
    <div className="glass-panel max-w-2xl rounded-3xl border border-white/5 px-12 py-16">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-lg">
        A
      </div>
      <h1 className="mb-4 text-5xl font-bold text-white">Welcome to AURA</h1>
      <p className="mb-2 text-xl text-neutral">
        Retinal Vascular Health Screening System
      </p>
      <p className="mb-8 text-lg text-neutral">
        Hệ Thống Sàng Lọc Sức Khỏe Mạch Máu Võng Mạc
      </p>
      <div className="space-y-4 text-left">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
          <h3 className="mb-2 text-lg font-semibold text-primary">🚀 Status</h3>
          <p className="text-neutral">System is up and running!</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
          <h3 className="mb-2 text-lg font-semibold text-accent">✨ Version</h3>
          <p className="text-neutral">v1.0.0 - Production Ready</p>
        </div>
      </div>
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
        >
          Login
        </Link>
      </div>
    </div>
  </div>
);

export default HomePage;

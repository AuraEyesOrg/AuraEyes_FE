/**
 * LoginPage - Authentication page
 * TODO: Implement actual login logic
 */
const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="glass-panel max-w-md w-full rounded-3xl border border-white/5 px-12 py-16">
        <h1 className="mb-8 text-3xl font-bold text-white text-center">
          Login to AURA
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

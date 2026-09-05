import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <span className="font-display text-lg italic text-ink">Together</span>
        <button
          onClick={handleLogout}
          className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5"
        >
          Log out
        </button>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <p className="text-sm font-medium text-cursor-green">Signed in</p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          Welcome, {user?.email ?? 'there'}.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-soft">
          Your documents will live here. This is a placeholder screen —
          wire it up once the documents-service API is ready.
        </p>
      </div>
    </div>
  );
}

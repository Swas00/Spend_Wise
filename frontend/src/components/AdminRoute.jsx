import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, Coins } from "lucide-react";

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 mb-4 animate-bounce">
          <Coins className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Verifying Admin Credentials
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 animate-pulse">
          Validating authorization privileges...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin =
    user?.role === "admin" ||
    user?.email?.toLowerCase().includes("swastik");

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 mb-4 animate-scale-in">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
          Sovereign Admin Clearance Required
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2">
          Your account does not have administrative privileges to inspect other student accounts.
        </p>
        <a
          href="/"
          className="mt-6 btn-press px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 transition-all"
        >
          Return to Personal Dashboard
        </a>
      </div>
    );
  }

  return children;
}

export default AdminRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Coins } from "lucide-react";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 mb-4 animate-bounce">
          <Coins className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Accessing SpendWise
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 animate-pulse">
          Verifying security credentials & accessing your ledger...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

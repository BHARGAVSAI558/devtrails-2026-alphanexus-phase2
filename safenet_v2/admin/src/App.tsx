import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/Layout';
import Login from './pages/Login';
import { useAuthStore } from './stores/auth';

const queryClient = new QueryClient();
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Workers = React.lazy(() => import('./pages/Workers'));
const ZoneHeatmap = React.lazy(() => import('./pages/ZoneHeatmap'));
const Simulations = React.lazy(() => import('./pages/Simulations'));
const FraudInsights = React.lazy(() => import('./pages/FraudInsights'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const jwt = useAuthStore((s) => s.jwt);
  const expiresAtMs = useAuthStore((s) => s.expiresAtMs);
  const signOut = useAuthStore((s) => s.signOut);

  const now = Date.now();
  const expired = Boolean(jwt && expiresAtMs && expiresAtMs <= now);

  React.useEffect(() => {
    if (expired) signOut();
  }, [expired, signOut]);

  if (!jwt || expired) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<React.Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><Dashboard /></React.Suspense>} />
            <Route path="zones" element={<React.Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><ZoneHeatmap /></React.Suspense>} />
            <Route path="workers" element={<React.Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><Workers /></React.Suspense>} />
            <Route path="simulations" element={<React.Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><Simulations /></React.Suspense>} />
            <Route path="fraud" element={<React.Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><FraudInsights /></React.Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


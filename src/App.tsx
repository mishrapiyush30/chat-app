import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthPage from './components/AuthPage';
import ChatRoom from './components/ChatRoom';

const queryClient = new QueryClient();

const App = () => {
  // Add a route handler for health check
  if (window.location.pathname === '/health') {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        STATUS: OK
        <br />
        TIMESTAMP: {new Date().toISOString()}
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/chat" element={<ChatRoom />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FlightAnalysis = lazy(() => import("./pages/FlightAnalysis"));
const Predictions = lazy(() => import("./pages/Predictions"));
const CascadeRisk = lazy(() => import("./pages/CascadeRisk"));
const Configuration = lazy(() => import("./pages/Configuration"));
const ChatAssistant = lazy(() => import("./pages/ChatAssistant"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center p-8 text-black">Loading page...</div>}>
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={
              <PageSuspense>
                <Dashboard />
              </PageSuspense>
            } />
            <Route path="/analysis" element={
              <PageSuspense>
                <FlightAnalysis />
              </PageSuspense>
            } />
            {/* /routes removed - merged into Dashboard/Flight Analysis */}
            <Route path="/predictions" element={
              <PageSuspense>
                <Predictions />
              </PageSuspense>
            } />
            <Route path="/cascade" element={
              <PageSuspense>
                <CascadeRisk />
              </PageSuspense>
            } />
            <Route path="/config" element={
              <PageSuspense>
                <Configuration />
              </PageSuspense>
            } />
            <Route path="/chat" element={
              <PageSuspense>
                <ChatAssistant />
              </PageSuspense>
            } />
            <Route path="*" element={
              <PageSuspense>
                <NotFound />
              </PageSuspense>
            } />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

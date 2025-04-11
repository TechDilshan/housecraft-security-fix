import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import HousesPage from "./pages/HousesPage";
import HouseDetailPage from "./pages/HouseDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserRequestsPage from "./pages/UserRequestsPage";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserRequestsPage from "./pages/AdminUserRequestsPage";
import AddHousePage from "./pages/AddHousePage";
import EditHousePage from "./pages/EditHousePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/houses" element={<HousesPage />} />
            <Route path="/houses/:id" element={<HouseDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute>
                <UserRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="/engineer-dashboard" element={
              <ProtectedRoute allowedRoles={['engineer']}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/architect-dashboard" element={
              <ProtectedRoute allowedRoles={['architect']}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vastu-dashboard" element={
              <ProtectedRoute allowedRoles={['vastu']}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/user-requests" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-house" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddHousePage />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-house/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditHousePage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:_id" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

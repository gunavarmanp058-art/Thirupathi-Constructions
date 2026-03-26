import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ClientLayout } from "@/components/layout/ClientLayout";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import RoadConstruction from "./pages/services/RoadConstruction";
import WaterPipeline from "./pages/services/WaterPipeline";
import MachineryRental from "./pages/services/MachineryRental";
import Projects from "./pages/Projects";
import Machinery from "./pages/Machinery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientProjects from "./pages/client/ClientProjects";
import ClientProjectDetail from "./pages/client/ClientProjectDetail";
import ClientAIReports from "./pages/client/ClientAIReports";
import ClientMachinery from "./pages/client/ClientMachinery";
import ClientContact from "./pages/client/ClientContact";
import ClientChat from "./pages/client/ClientChat";

// Admin Pages
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUploadProgress from "./pages/admin/AdminUploadProgress";
import AdminMachinery from "./pages/admin/AdminMachinery";
import AdminBookingRequests from "./pages/admin/AdminBookingRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminChat from "./pages/admin/AdminChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Login/Signup pages without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public pages with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/services/road-construction" element={<Layout><RoadConstruction /></Layout>} />
          <Route path="/services/water-pipeline" element={<Layout><WaterPipeline /></Layout>} />
          <Route path="/services/machinery-rental" element={<Layout><MachineryRental /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/machinery" element={<Layout><Machinery /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Client Portal */}
          <Route path="/client" element={<ClientLayout />}>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjects />} />
            <Route path="projects/:id" element={<ClientProjectDetail />} />
            <Route path="ai-reports" element={<ClientAIReports />} />
            <Route path="machinery" element={<ClientMachinery />} />
            <Route path="chat" element={<ClientChat />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<ClientContact />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="upload-progress" element={<AdminUploadProgress />} />
            <Route path="machinery" element={<AdminMachinery />} />          <Route path="booking-requests" element={<AdminBookingRequests />} />            <Route path="users" element={<AdminUsers />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

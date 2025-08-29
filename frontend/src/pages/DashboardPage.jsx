import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { getDashboardOverview } from '../api/dashboardApi';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import PerformanceOverview from '../components/dashboard/PerformanceOverview';
import InterviewHistory from '../components/dashboard/InterviewHistory';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { token, isAuthenticated, user } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardOverview(token);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Please try again.');
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && isAuthenticated) {
      fetchDashboardData();
    }
  }, [token, isAuthenticated, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 mb-6">
            <p className="text-red-200 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="border-red-400/30 text-red-200 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          </div>
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/70 mt-1">Welcome back, {user?.username}!</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger 
              value="overview" 
              className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer"
            >
              Performance Overview
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer"
            >
              Interview History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceOverview data={dashboardData} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InterviewHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;

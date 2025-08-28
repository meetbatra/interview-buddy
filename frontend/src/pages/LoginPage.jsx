import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../stores/authStore';
import { login } from '../api/userApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  
  const { isAuthenticated, login: loginToStore } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLoadingChange = (loading) => {
    setIsGoogleLoading(loading);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(email, password);
      
      if (response.data.success) {
        loginToStore({ user: response.data.data.user, token: response.data.data.token });
        toast.success(`Welcome back, ${response.data.data.user.username}!`);
        navigate('/');
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-white mb-2">Welcome Back</CardTitle>
        <CardDescription className="text-white/70">Sign in to your account</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-white/80 mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80 mb-2 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-white/60">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Login Button */}
            <GoogleLoginButton onLoadingChange={handleGoogleLoadingChange} />

            {/* Google Loading Overlay */}
            {isGoogleLoading && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Completing Google Sign In...</p>
                  <p className="text-white/60 text-sm mt-2">Please wait while we process your authentication</p>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-white/60">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-white hover:text-white/80 underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;

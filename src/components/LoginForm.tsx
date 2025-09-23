import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { googleLogin } from '@/services/authService';

const LoginForm = () => {
  const { login, updateUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      // Get the redirect path from location state or use role-based redirect
      const from = location.state?.from?.pathname || '/';
      
      if (from === '/login') {
        // If redirected from login page itself, use role-based redirect
        const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
        if (user && user.role) {
          switch(user.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'engineer':
              navigate('/engineer-dashboard');
              break;
            case 'architect':
              navigate('/architect-dashboard');
              break;
            case 'vastu':
              navigate('/vastu-dashboard');
              break;
            default:
              navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        // Redirect to the page user was trying to access
        navigate(from);
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Identity Services init and button render
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const gis = (window as any).google?.accounts?.id;
    if (!clientId || !gis) return;

      gis.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          setIsLoading(true);
            const data = await googleLogin(resp.credential);
            // Immediately reflect authenticated user in context
            updateUserData(data);
            // Navigate to home after successful Google login
            navigate('/', { replace: true });
            window.location.reload();
        } catch (err) {
          console.error('Google login failed', err);
        } finally {
          setIsLoading(false);
        }
      },
      ux_mode: 'popup',
      auto_select: false,
    });

    gis.renderButton(document.getElementById('googleBtn'), {
      theme: 'outline',
      size: 'large',
      width: 320,
      type: 'standard',
      text: 'continue_with',
      shape: 'rectangular',
    });

    setIsGoogleReady(true);
  }, []);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Log in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mt-2 flex flex-col items-center">
            <div id="googleBtn" className="w-full flex justify-center" />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
          
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-accent underline underline-offset-4 hover:text-accent-foreground"
            >
              Sign up
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;

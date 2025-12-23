import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ClipboardCheck, Shield } from 'lucide-react';

export default function AdminSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(name, email, password, 'super_admin');
      if (success) {
        toast.success('Admin account created successfully!');
        navigate('/dashboard/super-admin');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
              <ClipboardCheck className="w-8 h-8 text-accent-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">ProTrack Admin</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Create Admin Account
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Register as a super administrator to configure and oversee the entire FYP tracking system.
          </p>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-foreground/10 max-w-sm">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-sm text-primary-foreground/80">
              Restricted access area for system administrators only.
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Admin Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <ClipboardCheck className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ProTrack Admin</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Admin Sign Up</CardTitle>
              <CardDescription>
                Create a super admin account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-name">Full Name</Label>
                  <Input
                    id="admin-signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-signup-email">Email</Label>
                  <Input
                    id="admin-signup-email"
                    type="email"
                    placeholder="admin@protrack.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-signup-password">Password</Label>
                  <Input
                    id="admin-signup-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up as Admin'}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Already have an admin account?{' '}
                <Link to="/admin" className="text-accent hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


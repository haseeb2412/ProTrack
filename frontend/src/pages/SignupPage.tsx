import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ClipboardCheck, Users, GraduationCap } from 'lucide-react';
import type { UserRole } from '@/types';

const roleInfo = {
  teacher: {
    icon: Users,
    title: 'Teacher',
    description: 'View assigned groups, approve tasks, and provide feedback',
    color: 'text-success',
  },
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Create tasks, upload work, and track progress',
    color: 'text-warning',
  },
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
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
      const success = await signup(name, email, password, selectedRole);
      if (success) {
        toast.success('Account created successfully!');
        navigate(`/dashboard/${selectedRole.replace('_', '-')}`);
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
            <span className="text-3xl font-bold text-primary-foreground">ProTrack</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Join ProTrack Today
          </h1>
          
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Create your account and start managing your Final Year Projects efficiently. 
            Get organized and achieve your academic goals.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(roleInfo).map(([role, info]) => (
              <div key={role} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center mx-auto mb-2">
                  <info.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm text-primary-foreground/80">{info.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <ClipboardCheck className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ProTrack</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Sign up to get started with ProTrack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="student" className="text-xs sm:text-sm">Student</TabsTrigger>
                  <TabsTrigger value="teacher" className="text-xs sm:text-sm">Teacher</TabsTrigger>
                </TabsList>

                {Object.entries(roleInfo).map(([role, info]) => (
                  <TabsContent key={role} value={role} className="mt-0">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary mb-6">
                      <info.icon className={`w-5 h-5 ${info.color}`} />
                      <span className="text-sm text-secondary-foreground">{info.description}</span>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
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
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:underline font-medium">
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


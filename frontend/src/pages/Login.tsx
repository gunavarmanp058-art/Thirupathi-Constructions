import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Mail, Lock, ArrowRight, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("client");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, profile } = response.data.data;

      // Role check: Ensure user is using the correct tab
      if (activeTab === "client" && profile.role !== "CLIENT") {
        setIsLoading(false);
        return toast({
          title: "Access Denied",
          description: "This is a Company Admin account. Please use the Admin tab.",
          variant: "destructive",
        });
      }
      if (activeTab === "admin" && profile.role !== "ADMIN") {
        setIsLoading(false);
        return toast({
          title: "Access Denied",
          description: "This is a Client account. Please use the Client tab.",
          variant: "destructive",
        });
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(profile));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${profile.name}`,
      });

      if (profile.role === "CLIENT") {
        navigate("/client/dashboard");
      } else if (profile.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Connection error. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-xl font-bold uppercase">Thirupathi Constructions</p>
              <p className="text-sm text-primary-foreground/70">Portal Login</p>
            </div>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-display font-bold leading-tight">
              Track Your Projects<br />
              <span className="text-primary-foreground/80">In Real Time</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-md">
              Access your project dashboard, view progress reports, machinery status,
              and AI-powered insights all in one place.
            </p>

            <div className="space-y-4 pt-4">
              {[
                "Real-time project progress tracking",
                "AI-powered machinery health reports",
                "Direct communication with project managers",
                "Weekly progress photos & videos",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  <span className="text-primary-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HardHat className="h-6 w-6" />
              </div>
              <span className="font-display text-lg font-bold uppercase">Thirupathi Constructions</span>
            </Link>
          </div>

          <Card className="border-0 shadow-elevated">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display">
                {activeTab === "client" ? "Client Login" : "Company Login"}
              </CardTitle>
              <CardDescription>
                {activeTab === "client"
                  ? "Sign in to track your assigned projects"
                  : "Internal portal for company administrators"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setEmail(""); setPassword(""); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="client" className="gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="client">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="client-password">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="client-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : (
                        <>
                          Sign In to Client Portal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@company.com"
                          className="pl-10"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="admin-password">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : (
                        <>
                          Sign In to Admin Portal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>


              </Tabs>

              <div className="mt-6 text-center">
                {activeTab === "client" && (
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Sign up here
                    </Link>
                  </p>
                )}
                {activeTab === "admin" && (
                  <p className="text-sm text-muted-foreground">
                    Admin signup is restricted.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>
            {" "}and{" "} 
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

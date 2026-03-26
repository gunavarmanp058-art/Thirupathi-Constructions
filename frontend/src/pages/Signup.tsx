import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Mail, Lock, ArrowRight, User, Building2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function Signup() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [activeRole, setActiveRole] = useState("client");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        company_name: "",
        phone: "",
        address: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === "phone") {
            const numericValue = value.replace(/\D/g, "").slice(0, 10);
            setFormData({ ...formData, [id]: numericValue });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Name validation (min 3 chars, letters only)
        const nameRegex = /^[A-Za-z\s]{3,}$/;
        if (!nameRegex.test(formData.name)) {
            return toast({
                title: "Validation Error",
                description: "Name must be at least 3 characters and contain only letters.",
                variant: "destructive"
            });
        }

        // Phone validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (activeRole === "client" && !phoneRegex.test(formData.phone)) {
            return toast({
                title: "Validation Error",
                description: "Phone number must be exactly 10 digits",
                variant: "destructive"
            });
        }

        // Strong password validation
        // 8+ chars, uppercase, lowercase, number, special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            return toast({
                title: "Validation Error",
                description: "Password must be 8+ characters with uppercase, lowercase, number & special character",
                variant: "destructive"
            });
        }

        if (formData.password !== formData.confirmPassword) {
            return toast({
                title: "Validation Error",
                description: "Passwords do not match",
                variant: "destructive"
            });
        }

        setIsLoading(true);

        try {
            await api.post("/auth/register", {
                ...formData,
                role: activeRole.toUpperCase()
            });

            toast({
                title: "Registration Successful",
                description: `Your ${activeRole} account has been created.`,
            });

            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.message || "Something went wrong. Please try again.",
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
                            <p className="text-sm text-primary-foreground/70">Partner Portal</p>
                        </div>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-display font-bold leading-tight">
                            Join Our Network of<br />
                            <span className="text-primary-foreground/80">Infrastructure Leaders</span>
                        </h1>
                        <p className="text-lg text-primary-foreground/70 max-w-md">
                            Create your account to start tracking projects, managing assets, and accessing AI insights.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
                <div className="w-full max-w-lg py-12 animate-fade-in">
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
                            <CardTitle className="text-2xl font-display">Create Account</CardTitle>
                            <CardDescription>
                                Choose your role and join our platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <User className="h-4 w-4" />
                                    Client Registration Portal
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                className={`pl-10 ${formData.name && !/^[A-Za-z\s]{3,}$/.test(formData.name) ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {formData.name && !/^[A-Za-z\s]{3,}$/.test(formData.name) && (
                                            <p className="text-[11px] text-destructive">
                                                Minimum 3 letters. No numbers or symbols allowed.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" placeholder="john@example.com" className="pl-10" required value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                {activeRole === "client" && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="company_name">Company Name</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input id="company_name" placeholder="ABC Infra Ltd" className="pl-10" required value={formData.company_name} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="9876543210"
                                                        className={`pl-10 ${formData.phone && formData.phone.length !== 10 ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        required
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                {formData.phone && formData.phone.length !== 10 && (
                                                    <p className="text-[11px] text-destructive">
                                                        Must be exactly 10 digits
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input id="address" placeholder="123 Construction Hub, Chennai" className="pl-10" required value={formData.address} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className={`pl-10 ${formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password) ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password) && (
                                            <p className="text-[10px] text-destructive leading-tight">
                                                Must be 8+ chars with uppercase, lowercase, number & special char.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className={`pl-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className="text-[11px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? "Creating Account..." : (
                                        <>
                                            Sign Up Now
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary hover:underline font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Truck, Filter, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import heroMachinery from "@/assets/hero-machinery.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const categories = ["All", "Backhoe Loader", "Excavator", "Roller", "Crane", "Dump Truck"];

export default function Machinery() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clientRequests, setClientRequests] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchMachines = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/machines", { signal: controller.signal });
        setMachines(res.data.data);
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error("Failed to fetch machinery", error);
        }
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (token && user) {
        setIsLoggedIn(true);
        setUserRole(user.role);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || ""
        }));
        if (user.role === "CLIENT") {
          try {
            const res = await api.get("/client/booking-requests", { signal: controller.signal });
            setClientRequests(res.data.data);
          } catch (error: any) {
            if (error.name !== 'CanceledError') {
              console.error("Failed to fetch client requests");
            }
          }
        }
      }
    };

    fetchMachines();
    checkAuth();

    return () => controller.abort();
  }, []);

  const fetchClientRequests = async () => {
    try {
      const res = await api.get("/client/booking-requests");
      setClientRequests(res.data.data);
    } catch (error) {
      console.error("Failed to fetch client requests");
    }
  };

  const openBooking = (machine: any) => {
    if (!isLoggedIn) {
      toast({ 
        title: "Login Required", 
        description: "Please login as a client to book equipment directly.",
        action: <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Login</Button>
      });
      // Fallback to enquiry even if not logged in? Or just show the form anyway.
    }
    setSelectedMachine(machine);
    const defaultMsg = isLoggedIn && userRole === "CLIENT"
      ? `I would like to hire the ${machine.name} (${machine.model}) for my upcoming projects.`
      : `I am interested in the ${machine.name} (${machine.model}). Please provide more details on availability and pricing.`;
    
    setFormData({
      ...formData,
      message: defaultMsg
    });
    setBookingDialogOpen(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Phone validation (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isLoggedIn && userRole === "CLIENT") {
        // Logged in client flow - Creates a formal Booking Request
        await api.post("/client/booking-requests", {
          machine_id: selectedMachine?.id,
          project_id: null,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        });
        toast({ title: "Booking Request Sent", description: "Your formal hire request has been submitted to admin for approval." });
        fetchClientRequests();
      } else {
        // Public enquiry flow
        await api.post("/public/enquiry", {
          ...formData,
          enquiryType: "Machinery Rental",
          organization: "Public Request",
          machine_id: selectedMachine?.id
        });
        toast({ title: "Enquiry Sent", description: "Your enquiry has been sent. Our team will contact you soon." });
      }
      
      setBookingDialogOpen(false);
      setFormData(prev => ({ ...prev, phone: "", message: "" }));
    } catch (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMachineRequestStatus = (machineId: number) => {
    return clientRequests.find(r => r.machine_id === machineId);
  };

  const filteredMachinery = selectedCategory === "All"
    ? machines
    : machines.filter((m) => m.type === selectedCategory);

  const getConditionBadge = (status: string, machineId: number) => {
    const request = getMachineRequestStatus(machineId);
    
    // If client HAS an accepted request for this machine
    if (status === "ASSIGNED" || request?.status === 'ACCEPTED') {
      return (
        <Badge className="status-critical gap-1">
          <XCircle className="h-3 w-3" />
          Not Available
        </Badge>
      );
    }

    if (status === "MAINTENANCE") {
      return (
        <Badge className="status-warning gap-1">
          <AlertTriangle className="h-3 w-3" />
          Maintenance
        </Badge>
      );
    }

    return (
      <Badge className="status-good gap-1">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground section-padding overflow-hidden">
        <img src={heroMachinery} alt="Construction machinery fleet" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-primary-foreground/70 mb-4 text-sm font-medium">Machinery Gallery</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Our Equipment Fleet
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Explore our comprehensive fleet of well-maintained construction machinery
              available for hire with specialized operator support.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by category:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p>Loading our equipment gallery...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMachinery.map((machine, index) => {
                const request = getMachineRequestStatus(machine.id);
                const isHired = machine.status === 'ASSIGNED';
                
                return (
                  <Card
                    key={machine.id}
                    className="group hover:shadow-elevated transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Truck className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        {machine.image_url && (
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${machine.image_url}`}
                            alt={machine.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute top-3 left-3">
                          {getConditionBadge(machine.status, machine.id)}
                        </div>
                        
                        {isHired && (
                          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 rounded shadow-sm border border-border">
                              NOT AVAILABLE
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {machine.type}
                          </Badge>
                        </div>
                        <h3 className="font-display font-semibold text-foreground mb-1">
                          {machine.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">{machine.model}</p>
                        
                        <Button
                          size="sm"
                          className="w-full"
                          variant={isHired || machine.status === 'MAINTENANCE' ? "secondary" : "default"}
                          disabled={isHired || machine.status === 'MAINTENANCE' || request?.status === 'PENDING'}
                          onClick={() => openBooking(machine)}
                        >
                          {request?.status === 'PENDING' ? 'Pending Approval' : 
                           isHired ? 'Not Available' : 
                           'Book Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && filteredMachinery.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No machinery found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isLoggedIn && userRole === "CLIENT" ? "Hire Equipment" : "Enquire for Rental"}</DialogTitle>
            <DialogDescription>
              {isLoggedIn && userRole === "CLIENT" 
                ? `Submit a hire request for ${selectedMachine?.name}. Once approved, this machine will be reserved for you.`
                : `Interested in ${selectedMachine?.name}? Leave your details and our team will provide a quote and availability details.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name" required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email" type="email" required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone" required
                  maxLength={10}
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Requirement Details</Label>
              <Textarea
                id="message" rows={3}
                placeholder="How long do you need the machine for?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLoggedIn && userRole === "CLIENT" ? "Submitting Request..." : "Sending Enquiry..."}
                </>
              ) : (
                isLoggedIn && userRole === "CLIENT" ? "Hire Machinery" : "Submit Enquiry"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Feature Highlight */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="mb-4">AI-Powered</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Smart Maintenance Prediction
              </h2>
              <p className="text-muted-foreground mb-6">
                Our AI system continuously monitors machine health using working hours,
                fuel consumption, and maintenance history to predict maintenance needs
                and prevent unexpected breakdowns.
              </p>
              <div className="space-y-3">
                {[
                  "Real-time condition monitoring",
                  "Predictive maintenance alerts",
                  "Reduced downtime by 40%",
                  "Detailed health reports for clients",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold mb-4">Sample AI Report</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Machine</span>
                      <span className="text-sm font-medium">JCB 3DX #1</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Condition</span>
                      <Badge className="status-good">Good</Badge>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Working Hours</span>
                      <span className="text-sm font-medium">2,450 hrs</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Next Service</span>
                      <span className="text-sm font-medium text-primary">In 120 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Remaining Life</span>
                      <span className="text-sm font-medium">~4,500 hrs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-tight text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Need Equipment for Your Project?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Get competitive hire rates with trained operators and 24/7 support.
            Contact us for availability and quotes.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Get Hire Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, CheckCircle, AlertTriangle, XCircle, Wrench, Clock, Plus, Loader2, Activity, ChevronRight, Zap, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function ClientMachinery() {
  const { toast } = useToast();
  const [assignedMachines, setAssignedMachines] = useState<any[]>([]);
  const [availableFleet, setAvailableFleet] = useState<any[]>([]);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);
  const [isLoadingFleet, setIsLoadingFleet] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnMachineId, setReturnMachineId] = useState<number | null>(null);
  const [returnFormData, setReturnFormData] = useState({
    working_hours: "",
    fuel_used: "",
    breakdown_count: "0",
    last_maintenance_date: new Date().toISOString().split('T')[0],
    media: null as File | null
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const fetchMachines = async () => {
    try {
      setIsLoadingMachines(true);
      const res = await api.get("/client/machines");
      setAssignedMachines(res.data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch assigned machines", variant: "destructive" });
    } finally {
      setIsLoadingMachines(false);
    }
  };

  const fetchFleet = async () => {
    try {
      setIsLoadingFleet(true);
      const res = await api.get("/public/machines");
      setAvailableFleet(res.data.data);
    } catch (error) {
      console.error("Failed to fetch available fleet");
    } finally {
      setIsLoadingFleet(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const res = await api.get("/client/booking-requests");
      setBookingRequests(res.data.data);
    } catch (error) {
      console.error("Failed to fetch booking requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchFleet();
    fetchBookingRequests();
    // Pre-fill user data if available
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setBookingFormData(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
    }
  }, []);

  const getMachineRequestStatus = (machineId: number) => {
    const request = bookingRequests.find(r => r.machine_id === machineId);
    return request;
  };

  const openBooking = (machine: any) => {
    setSelectedMachine(machine);
    setBookingFormData(prev => ({
      ...prev,
      message: `I would like to request ${machine.name} (${machine.model}) for my project.`
    }));
    setBookingDialogOpen(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Phone validation (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(bookingFormData.phone)) {
      toast({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits", variant: "destructive" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.post("/client/booking-requests", {
        machine_id: selectedMachine?.id,
        project_id: null,
        full_name: bookingFormData.name,
        email: bookingFormData.email,
        phone: bookingFormData.phone,
        message: bookingFormData.message
      });
      toast({ title: "Request Sent", description: "Your machinery booking request has been submitted. Admin will review it soon." });
      setBookingDialogOpen(false);
      fetchBookingRequests();
    } catch (error) {
      toast({ title: "Error", description: "Request failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnMachineId) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("log_date", new Date().toISOString().split('T')[0]);
      formData.append("working_hours", returnFormData.working_hours);
      formData.append("fuel_used", returnFormData.fuel_used);
      formData.append("breakdown_count", returnFormData.breakdown_count);
      formData.append("last_maintenance_date", returnFormData.last_maintenance_date);
      if (returnFormData.media) {
        formData.append("media", returnFormData.media);
      }

      const res = await api.post(`/client/machines/${returnMachineId}/return`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAiAnalysis(res.data.data.aiAnalysis);
      toast({ 
        title: "Return Processed", 
        description: `Machine status: ${res.data.data.status}. AI analysis complete.` 
      });
      
      // Don't close immediately so user can see AI analysis if they want, 
      // or just refresh list
      fetchMachines();
      fetchFleet();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process return", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Assigned Machinery</h1>
            <p className="text-sm text-muted-foreground">Machines currently assigned to your projects with AI condition monitoring.</p>
          </div>
        </div>
        <Link to="/machinery">
          <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
            <Plus className="h-4 w-4" /> Book New Machine
          </Button>
        </Link>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hire {selectedMachine?.name}</DialogTitle>
            <DialogDescription>
              Submit a hire request for this equipment. Our logistics team will review and confirm availability.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required value={bookingFormData.name} onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={bookingFormData.email} onChange={(e) => setBookingFormData({ ...bookingFormData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  required 
                  inputMode="numeric"
                  maxLength={10}
                  value={bookingFormData.phone} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setBookingFormData({ ...bookingFormData, phone: value });
                  }}
                  className={bookingFormData.phone && bookingFormData.phone.length !== 10 ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="10 digit number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Booking Details</Label>
              <Textarea rows={3} value={bookingFormData.message} onChange={(e) => setBookingFormData({ ...bookingFormData, message: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Assigned to Your Projects
        </h2>
        {isLoadingMachines ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
            Loading assigned machinery...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {assignedMachines.map((machine) => (
              <Card key={machine.id} className="overflow-hidden border-muted shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {machine.image_url ? (
                          <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${machine.image_url}`} alt={machine.name} className="h-full w-full object-cover" />
                        ) : (
                          <Truck className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{machine.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {machine.model}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="status-good text-[10px]">
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-muted">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <Activity className="h-3 w-3 text-secondary" /> Operational
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Currently deployed on your active site with 24/7 AI health monitoring.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs gap-2 border-primary/30 hover:bg-primary/10"
                      onClick={() => {
                        setReturnMachineId(machine.id);
                        setReturnDialogOpen(true);
                        setAiAnalysis(null);
                      }}
                    >
                      <ChevronRight className="h-3 w-3" /> Process Return
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {assignedMachines.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground italic">No machinery currently assigned to your projects.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            Available Fleet
          </h2>
          <Link to="/machinery" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View Gallery <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoadingFleet ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Fetching available fleet...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableFleet.map((machine) => (
              <Card key={machine.id} className="overflow-hidden group hover:border-primary/50 transition-all shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {machine.image_url ? (
                          <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${machine.image_url}`} alt={machine.name} className="h-full w-full object-cover" />
                        ) : (
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{machine.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{machine.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      machine.status === 'AVAILABLE' ? 'status-good' : 
                      machine.status === 'MAINTENANCE' ? 'status-critical bg-destructive/10 text-destructive border-destructive/20' : 
                      'status-warning',
                      "text-[10px]"
                    )}>
                      {machine.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant={!getMachineRequestStatus(machine.id) ? "default" : "outline"}
                    className="w-full mt-2"
                    disabled={machine.status === 'ASSIGNED' || getMachineRequestStatus(machine.id)?.status === 'PENDING'}
                    onClick={() => openBooking(machine)}
                  >
                    {getMachineRequestStatus(machine.id)?.status === 'ACCEPTED' && 'Confirmed Hire'}
                    {getMachineRequestStatus(machine.id)?.status === 'REJECTED' && 'Unavailable'}
                    {getMachineRequestStatus(machine.id)?.status === 'PENDING' && 'Pending...'}
                    {!getMachineRequestStatus(machine.id) && (machine.status === 'ASSIGNED' ? 'Hired' : 'Hire Now')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Return Sheet (Sidebar experience) */}
      <Sheet open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-xl font-display font-bold">Return Machinery & AI Audit</SheetTitle>
            <SheetDescription>
              Complete the final usage report. Our AI will analyze the data and photo to determine the machine's next status.
            </SheetDescription>
          </SheetHeader>
          {!aiAnalysis ? (
            <form onSubmit={handleReturnMachine} className="space-y-4 pt-6">
              <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                Please provide usage details for the AI to perform a health audit before the machine is returned to the pool.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input 
                    type="number" required 
                    placeholder="Total hours"
                    value={returnFormData.working_hours}
                    onChange={(e) => setReturnFormData({ ...returnFormData, working_hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuel Used (L)</Label>
                  <Input 
                    type="number" required 
                    placeholder="Liters"
                    value={returnFormData.fuel_used}
                    onChange={(e) => setReturnFormData({ ...returnFormData, fuel_used: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Machine Photo (Current Condition)</Label>
                <Input 
                  type="file" accept="image/*,video/*" required
                  onChange={(e) => setReturnFormData({ ...returnFormData, media: e.target.files ? e.target.files[0] : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Breakdowns Encountered</Label>
                <Input 
                  type="number"
                  value={returnFormData.breakdown_count}
                  onChange={(e) => setReturnFormData({ ...returnFormData, breakdown_count: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Process Return & AI Audit"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <p className="text-[10px] text-primary/70 uppercase tracking-[0.2em] font-black mb-2">AI Audit Verdict</p>
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full animate-pulse ${
                    aiAnalysis.condition === 'Good' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 
                    aiAnalysis.condition === 'Critical' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  }`} />
                  <h3 className="text-3xl font-display font-black tracking-tight text-foreground">{aiAnalysis.condition}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-black mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Runtime Remaining
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {aiAnalysis.estimated_remaining_usable_time_hours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                  <p className="text-[10px] text-primary uppercase tracking-widest font-black mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Health Score
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {aiAnalysis.condition === 'Good' ? '94%' : aiAnalysis.condition === 'Needs Maintenance' ? '68%' : '24%'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Recommended Action</p>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground/90 italic">"{aiAnalysis.recommendation}"</p>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold"
                  onClick={() => setReturnDialogOpen(false)}
                >
                  Return to Dashboard
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1">
                  <Zap className="h-2.5 w-2.5 text-primary" /> Audit powered by Sentinel AI-Vision v2.4
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

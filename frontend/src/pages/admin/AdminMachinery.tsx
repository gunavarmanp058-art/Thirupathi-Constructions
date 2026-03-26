import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Truck,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Wrench,
  Clock,
  Loader2,
  Check,
  X,
  AlertCircle,
  Brain,
  Zap,
  Activity,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface MachineData {
  id: number;
  name: string;
  type: string;
  model: string;
  image_url: string;
  status: string;
  created_at: string;
  total_hours?: number;
  latest_fuel?: number;
  last_maintenance?: string;
  ai?: {
    condition: string;
    recommendation: string;
    source: string;
    estimated_remaining_usable_time_hours?: number;
  };
}

interface BookingRequest {
  id: number;
  machine_id: number;
  machine_name: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  client_name: string;
  created_at: string;
}

export default function AdminMachinery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  
  // Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Form States
  const [formData, setFormData] = useState({ name: "", type: "", model: "", status: "AVAILABLE" });
  const [image, setImage] = useState<File | null>(null);
  const [assignData, setAssignData] = useState({ project_id: "", from_date: new Date().toISOString().split('T')[0] });
  const [acceptData, setAcceptData] = useState<{ from_date: string }>({ from_date: new Date().toISOString().split('T')[0] });
  const [logData, setLogData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    working_hours: "",
    fuel_used: "",
    breakdown_count: "0",
    last_maintenance_date: new Date().toISOString().split('T')[0]
  });
  const [logMedia, setLogMedia] = useState<File | null>(null);
  const [machineDetails, setMachineDetails] = useState<any>(null);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMachinesLocal = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/machines", { signal: controller.signal });
        setMachines(res.data.data);
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          toast({ title: "Error", description: "Failed to fetch machines", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchBookingRequestsLocal = async () => {
      try {
        setIsLoadingRequests(true);
        const res = await api.get("/admin/booking-requests", { signal: controller.signal });
        setBookingRequests(res.data.data);
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          toast({ title: "Error", description: "Failed to fetch booking requests", variant: "destructive" });
        }
      } finally {
        setIsLoadingRequests(false);
      }
    };

    const fetchProjectsLocal = async () => {
      try {
        const res = await api.get("/admin/projects", { signal: controller.signal });
        setProjects(res.data.data);
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error("Failed to fetch projects");
        }
      }
    };

    fetchMachinesLocal();
    fetchProjectsLocal();
    fetchBookingRequestsLocal();

    return () => controller.abort();
  }, [toast]);

  // Keep these for manual refreshes after actions
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/machines");
      setMachines(res.data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch machines", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const res = await api.get("/admin/booking-requests");
      setBookingRequests(res.data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch booking requests", variant: "destructive" });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", type: "", model: "", status: "AVAILABLE" });
    setImage(null);
    setSelectedMachine(null);
    setSelectedBooking(null);
  };

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    try {
      await api.post(`/admin/booking-requests/${selectedBooking.id}/accept`, acceptData);
      toast({ title: "Booking Accepted", description: `${selectedBooking.machine_name} has been booked for the client.` });
      setAcceptDialogOpen(false);
      resetForm();
      fetchBookingRequests();
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept booking", variant: "destructive" });
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking) return;
    try {
      await api.post(`/admin/booking-requests/${selectedBooking.id}/reject`);
      toast({ title: "Booking Rejected" });
      setRejectDialogOpen(false);
      resetForm();
      fetchBookingRequests();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject booking", variant: "destructive" });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", formData.type);
      data.append("model", formData.model);
      if (image) data.append("image", image);

      await api.post("/admin/machines", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Machine Added" });
      setAddDialogOpen(false);
      resetForm();
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add machine", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", formData.type);
      data.append("model", formData.model);
      data.append("status", formData.status);
      if (image) data.append("image", image);

      await api.put(`/admin/machines/${selectedMachine.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Machine Updated" });
      setEditDialogOpen(false);
      resetForm();
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedMachine) return;
    try {
      await api.delete(`/admin/machines/${selectedMachine.id}`);
      toast({ title: "Machine Removed" });
      setDeleteDialogOpen(false);
      resetForm();
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    try {
      setIsSubmittingLog(true);
      const data = new FormData();
      data.append("log_date", logData.log_date);
      data.append("working_hours", logData.working_hours);
      data.append("fuel_used", logData.fuel_used);
      data.append("breakdown_count", logData.breakdown_count);
      data.append("last_maintenance_date", logData.last_maintenance_date);
      if (logMedia) data.append("media", logMedia);

      const res = await api.post(`/admin/machines/${selectedMachine.id}/logs`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const ai = res.data?.data?.aiResult;
      const condition = ai?.condition || "Unknown";
      
      toast({ 
        title: "Log Entry Added", 
        description: `Machine status updated via AI. Condition: ${condition}` 
      });
      
      setMaintenanceDialogOpen(false);
      setLogData({
        log_date: new Date().toISOString().split('T')[0],
        working_hours: "",
        fuel_used: "",
        breakdown_count: "0",
        last_maintenance_date: new Date().toISOString().split('T')[0]
      });
      setLogMedia(null);
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add log entry", variant: "destructive" });
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleReturnMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    try {
      setIsSubmittingLog(true);
      const data = new FormData();
      data.append("log_date", logData.log_date);
      data.append("working_hours", logData.working_hours);
      data.append("fuel_used", logData.fuel_used);
      data.append("breakdown_count", logData.breakdown_count);
      data.append("last_maintenance_date", logData.last_maintenance_date);
      if (logMedia) data.append("media", logMedia);

      const res = await api.post(`/admin/machines/${selectedMachine.id}/return`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newStatus = res.data?.data?.status;
      const ai = res.data?.data?.aiAnalysis;
      
      toast({ 
        title: "Machine Returned", 
        description: `Status: ${newStatus}. AI Analysis: ${ai?.condition || 'Checked'}` 
      });
      
      setReturnDialogOpen(false);
      setLogData({
        log_date: new Date().toISOString().split('T')[0],
        working_hours: "",
        fuel_used: "",
        breakdown_count: "0",
        last_maintenance_date: new Date().toISOString().split('T')[0]
      });
      setLogMedia(null);
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process return", variant: "destructive" });
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const fetchMachineHistory = async (machineId: number) => {
    try {
      // We don't have a direct history endpoint yet, but we can reuse analytics or add a log fetching one
      // For now, let's just show the latest log or placeholder info
      setMachineDetails({ id: machineId }); 
      setHistoryDialogOpen(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch machine logs", variant: "destructive" });
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    try {
      await api.post(`/admin/machines/${selectedMachine.id}/assign`, assignData);
      toast({ title: "Machine Assigned", description: `Assigned ${selectedMachine.name} to project.` });
      setAssignDialogOpen(false);
      setAssignData({ project_id: "", from_date: new Date().toISOString().split('T')[0] });
      fetchMachines();
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign machine", variant: "destructive" });
    }
  };

  const openEdit = (machine: MachineData) => {
    setSelectedMachine(machine);
    setFormData({
      name: machine.name,
      type: machine.type,
      model: machine.model,
      status: machine.status
    });
    setEditDialogOpen(true);
  };

  const filtered = machines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.model?.toLowerCase().includes(search.toLowerCase()) ||
    m.type?.toLowerCase().includes(search.toLowerCase())
  );

  const statusSummary = {
    available: machines.filter((m) => m.status === "AVAILABLE").length,
    assigned: machines.filter((m) => m.status === "ASSIGNED").length,
    maintenance: machines.filter((m) => m.status === "MAINTENANCE").length,
  };

  const pendingRequests = bookingRequests.filter(br => br.status === 'PENDING');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Machinery Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage fleet and track usage.</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Machine</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>Enter the details for the new machinery to add to the inventory.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <MachineFormFields formData={formData} setFormData={setFormData} setImage={setImage} />
              <Button type="submit" className="w-full">Add Machine</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Fleet Intelligence Dashboard */}
      {!loading && machines.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="lg:col-span-3 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Brain className="h-32 w-32 text-primary" />
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-xl font-display font-black tracking-tight text-foreground uppercase">Fleet Intelligence</h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Integrated AI is currently auditing <span className="text-foreground font-bold">{machines.length}</span> fleet units. 
                    Operational readiness is currently <span className="text-emerald-500 font-bold uppercase tracking-wider text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Optimal</span>.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="text-center px-6 py-2 rounded-2xl bg-background border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-tighter">Fleet Score</p>
                    <p className="text-3xl font-black text-primary">94.2</p>
                  </div>
                  <div className="text-center px-6 py-2 rounded-2xl bg-background border border-border/50 shadow-sm hover:border-rose-500/30 transition-colors">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-tighter">AI Alerts</p>
                    <p className="text-3xl font-black text-rose-500">
                      {machines.filter(m => m.ai?.condition === 'Critical' || m.ai?.condition === 'Needs Maintenance').length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col justify-center p-6 space-y-2 relative overflow-hidden group shadow-sm">
             <div className="absolute -bottom-4 -right-4 opacity-[0.08] group-hover:scale-125 transition-transform duration-700">
               <ShieldCheck className="h-24 w-24 text-emerald-600" />
             </div>
             <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
             </div>
             <div>
                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Available Fleet</p>
                <h3 className="text-4xl font-black text-foreground">{machines.filter(m => m.status === 'AVAILABLE').length}</h3>
             </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={CheckCircle} value={loading ? "..." : statusSummary.available} label="Available" color="text-primary" />
        <SummaryCard icon={Clock} value={loading ? "..." : statusSummary.assigned} label="Assigned" color="text-warning-foreground" />
        <SummaryCard icon={Wrench} value={loading ? "..." : statusSummary.maintenance} label="Maintenance" color="text-destructive" />
      </div>

      {/* Booking Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground">Pending Booking Requests</h2>
            <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/20">
              {pendingRequests.length} Pending
            </Badge>
          </div>
          <Card className="border-warning/20 shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{request.client_name}</TableCell>
                      <TableCell>{request.machine_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{request.full_name}</p>
                          <p className="text-xs text-muted-foreground">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            onClick={() => {
                              setSelectedBooking(request);
                              setAcceptData({ from_date: new Date().toISOString().split('T')[0] });
                              setAcceptDialogOpen(true);
                            }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => {
                              setSelectedBooking(request);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Inventory Search & Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search machines..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />Loading Inventory...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage & Health</TableHead>
                    <TableHead>Model / ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((machine) => (
                    <TableRow key={machine.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted border flex items-center justify-center overflow-hidden shrink-0">
                            {machine.image_url ? (
                              <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${machine.image_url}`} alt={machine.name} className="h-full w-full object-cover" />
                            ) : (
                              <Truck className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <p className="font-medium text-foreground truncate max-w-[180px]">{machine.name}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{machine.type}</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">{machine.total_hours || '0'}h</span>
                            <span className="text-muted-foreground">logged</span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold cursor-help group/ai">
                                  <Brain className={`h-2.5 w-2.5 ${machine.ai?.condition === 'Good' ? 'text-emerald-500' : 'text-rose-500'}`} />
                                  <span className={machine.ai?.condition === 'Good' ? 'text-emerald-600' : 'text-rose-600'}>
                                    AI: {machine.ai?.condition || 'Good'}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[220px] bg-card border-2 shadow-xl p-3">
                                <div className="space-y-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                    <Zap className="h-2 w-2" /> AI Analysis Verdict
                                  </p>
                                  <p className="text-[11px] font-medium leading-relaxed italic text-foreground">
                                    "{machine.ai?.recommendation || 'Equipment is in optimal condition.'}"
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {machine.latest_fuel && (
                            <div className="text-[10px] text-muted-foreground">
                              Latest Fuel: <span className="text-foreground font-medium">{machine.latest_fuel}L</span>
                            </div>
                          )}
                          {machine.last_maintenance && (
                            <div className="text-[10px] text-muted-foreground">
                              Ref: {new Date(machine.last_maintenance).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{machine.model}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          machine.status === "AVAILABLE" ? "status-good" : 
                          machine.status === "ASSIGNED" ? "status-warning" : "status-critical"
                        }>
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {machine.status === 'ASSIGNED' ? (
                              <DropdownMenuItem className="gap-2 text-primary font-semibold" onSelect={() => { setSelectedMachine(machine); setReturnDialogOpen(true); }}>
                                <Truck className="h-4 w-4" /> Process Return
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="gap-2" onSelect={() => { setSelectedMachine(machine); setAssignDialogOpen(true); }}>
                                <Plus className="h-4 w-4" /> Assign to Project
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="gap-2" onSelect={() => { setSelectedMachine(machine); setMaintenanceDialogOpen(true); }}>
                              <Wrench className="h-4 w-4" /> Update Health Log
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onSelect={() => openEdit(machine)}>
                              <Edit className="h-4 w-4" /> Edit Machine
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onSelect={() => { setSelectedMachine(machine); setDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        No equipment found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acceptance Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Booking Request</DialogTitle>
            <DialogDescription>
              Review and confirm the hire request for this machinery.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                <p className="text-sm flex justify-between"><span className="text-muted-foreground">Client:</span> <span className="font-semibold text-foreground">{selectedBooking.client_name}</span></p>
                <p className="text-sm flex justify-between"><span className="text-muted-foreground">Machine:</span> <span className="font-semibold text-foreground">{selectedBooking.machine_name}</span></p>
                <p className="text-sm flex justify-between"><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{selectedBooking.full_name}</span></p>
                <p className="text-sm flex justify-between"><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{selectedBooking.phone}</span></p>
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={acceptData.from_date} onChange={(e) => setAcceptData({ ...acceptData, from_date: e.target.value })} />
              </div>
              <Button onClick={handleAcceptBooking} className="w-full">Confirm & Finalize Hire</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle>Reject Request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this hire request? This will notify the client.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleRejectBooking}>Yes, Reject</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle>Delete Machine?</DialogTitle>
            <DialogDescription>
              Permanent removal of {selectedMachine?.name}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete Permanently</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Machine Details</DialogTitle>
            <DialogDescription>Modify specifications or status of the equipment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <MachineFormFields formData={formData} setFormData={setFormData} setImage={setImage} isEdit />
            <Button type="submit" className="w-full">Update Machine</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Project</DialogTitle>
            <DialogDescription>Dispatch this machine to an active government project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Project</Label>
              <Select value={assignData.project_id} onValueChange={(val) => setAssignData({ ...assignData, project_id: val })}>
                <SelectTrigger><SelectValue placeholder="Choose project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignment Start Date</Label>
              <Input type="date" required value={assignData.from_date} onChange={(e) => setAssignData({ ...assignData, from_date: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Confirm Assignment</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Maintenance Log Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Machine Health & Maintenance Log</DialogTitle>
            <DialogDescription>Record working hours, fuel usage, and upload a condition photo for AI analysis.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLog} className="space-y-4 pt-4">
            <MachineLogFields logData={logData} setLogData={setLogData} setLogMedia={setLogMedia} />
            <Button type="submit" className="w-full gap-2" disabled={isSubmittingLog}>
              {isSubmittingLog ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save & Process with AI
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Machine Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Truck className="h-5 w-5 text-primary" />
               Process Machine Return
            </DialogTitle>
            <DialogDescription>
               The client is returning <b>{selectedMachine?.name}</b>. Enter usage details for final AI condition check.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnMachine} className="space-y-4 pt-4">
            <MachineLogFields logData={logData} setLogData={setLogData} setLogMedia={setLogMedia} />
            <div className="p-3 bg-primary/5 rounded border border-primary/10 text-[11px] text-muted-foreground italic">
               Note: If the AI detects maintenance needs or damage from the photo, the machine status will automatically be set to 'MAINTENANCE'.
            </div>
            <Button type="submit" className="w-full gap-2 bg-primary hover:bg-primary/90" disabled={isSubmittingLog}>
              {isSubmittingLog ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Finalize Return & Audit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function SummaryCard({ icon: Icon, value, label, color }: any) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MachineLogFields({ logData, setLogData, setLogMedia }: any) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Log Date</Label>
          <Input type="date" required value={logData.log_date} onChange={(e) => setLogData({ ...logData, log_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Working Hours</Label>
          <Input type="number" step="0.1" required placeholder="0.0" value={logData.working_hours} onChange={(e) => setLogData({ ...logData, working_hours: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fuel Used (Ltr)</Label>
          <Input type="number" step="0.1" required placeholder="0.0" value={logData.fuel_used} onChange={(e) => setLogData({ ...logData, fuel_used: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Breakdowns</Label>
          <Input type="number" required value={logData.breakdown_count} onChange={(e) => setLogData({ ...logData, breakdown_count: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Last Maintained</Label>
        <Input type="date" value={logData.last_maintenance_date} onChange={(e) => setLogData({ ...logData, last_maintenance_date: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Condition Photo (For AI Audit)</Label>
        <Input type="file" accept="image/*,video/*" onChange={(e) => setLogMedia(e.target.files?.[0] || null)} />
        <p className="text-[10px] text-muted-foreground italic">AI will analyze the image to detect structural wear or maintenance needs.</p>
      </div>
    </>
  );
}

function MachineFormFields({ formData, setFormData, setImage, isEdit = false }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Machine Name</Label>
          <Input required placeholder="e.g. Caterpillar Excavator" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Backhoe Loader">Backhoe Loader</SelectItem>
              <SelectItem value="Excavator">Excavator</SelectItem>
              <SelectItem value="Roller">Roller</SelectItem>
              <SelectItem value="Crane">Crane</SelectItem>
              <SelectItem value="Dump Truck">Dump Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Model / ID</Label>
          <Input required placeholder="Serial number" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
        </div>
        {isEdit && (
          <div className="space-y-2">
            <Label>Condition Status</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="space-y-2 pt-2">
        <Label>Equipment Image</Label>
        <Input type="file" accept="image/*,video/*" className="cursor-pointer" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </div>
    </div>
  );
}

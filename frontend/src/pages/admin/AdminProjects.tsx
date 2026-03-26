import { useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Droplets,
  MapPin,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function AdminProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "ROAD",
    client_id: "",
    location: "",
    planned_start: "",
    planned_end: "",
    expected_end: "",
    status: "PLANNED"
  });

  // Fetch Projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const response = await api.get("/admin/projects");
      return response.data.data;
    },
  });

  // Fetch Clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const response = await api.get("/admin/clients");
      return response.data.data;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/admin/projects", formData);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project Created", description: "New project has been added." });
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      setIsSubmitting(true);
      await api.put(`/admin/projects/${selectedProject.id}`, formData);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project Updated", description: "Project details modified successfully." });
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project Deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "ROAD",
      client_id: "",
      location: "",
      planned_start: "",
      planned_end: "",
      expected_end: "",
      status: "PLANNED"
    });
    setSelectedProject(null);
  };

  const openEdit = (project: any) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      client_id: project.client_id?.toString() || "",
      location: project.location,
      planned_start: project.planned_start ? project.planned_start.split('T')[0] : "",
      planned_end: project.planned_end ? project.planned_end.split('T')[0] : "",
      expected_end: project.expected_end ? project.expected_end.split('T')[0] : "",
      status: project.status
    });
    setEditDialogOpen(true);
  };

  const filtered = projects.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-success/10 text-success border-success/20";
    if (status === "ON_HOLD") return "bg-destructive/10 text-destructive border-destructive/20";
    if (status === "ONGOING") return "bg-primary/10 text-primary border-primary/20";
    return "bg-muted text-muted-foreground border-muted-foreground/20";
  };

  if (projectsLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Project Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, update, and assign projects to clients.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter project details and assign a client to start tracking.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <ProjectFormFields formData={formData} setFormData={setFormData} clients={clients} isSubmitting={isSubmitting} submitLabel="Create Project" />
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Modify project timelines, status, or details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <ProjectFormFields formData={formData} setFormData={setFormData} clients={clients} isSubmitting={isSubmitting} submitLabel="Update Project" />
          </form>
        </DialogContent>
      </Dialog>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expected Completion</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      {project.type === "ROAD" ? <Building2 className="h-4 w-4 text-primary" /> : <Droplets className="h-4 w-4 text-primary" />}
                      {project.type}
                    </div>
                  </TableCell>
                  <TableCell><Badge className={statusColor(project.status)} variant="outline">{project.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-primary transition-all" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary">{Math.round(project.progress || 0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">
                      {project.client_name || <span className="text-muted-foreground italic">Public</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 inline mr-1" />{project.location}</TableCell>
                  <TableCell className="text-sm text-muted-foreground"><Calendar className="h-4 w-4 inline mr-1" />{project.expected_end ? new Date(project.expected_end).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onSelect={() => openEdit(project)}><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive" onSelect={() => handleDelete(project.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectFormFields({ formData, setFormData, clients, isSubmitting, submitLabel }: any) {
  return (
    <>
      <div className="space-y-2">
        <Label>Project name</Label>
        <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ROAD">Road Construction</SelectItem>
              <SelectItem value="WATER">Water Pipeline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assign Client</Label>
          <Select value={formData.client_id} onValueChange={(val) => setFormData({ ...formData, client_id: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {clients.map((c: any) => (
                <SelectItem key={c.client_id} value={c.client_id.toString()}>{c.company_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Input required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Planned Start</Label><Input type="date" required value={formData.planned_start} onChange={(e) => setFormData({ ...formData, planned_start: e.target.value })} /></div>
        <div><Label>Planned End</Label><Input type="date" required value={formData.planned_end} onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Expected End</Label><Input type="date" required value={formData.expected_end} onChange={(e) => setFormData({ ...formData, expected_end: e.target.value })} /></div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {submitLabel}
      </Button>
    </>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Droplets,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function ClientProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "ROAD",
    location: "",
    planned_start: "",
    planned_end: "",
    expected_end: "",
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["client-projects"],
    queryFn: async () => {
      const response = await api.get("/client/projects");
      return response.data.data;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/client/projects", formData);
      toast({ title: "Project Created", description: "Your new project has been added." });
      setDialogOpen(false);
      setFormData({ name: "", type: "ROAD", location: "", planned_start: "", planned_end: "", expected_end: "" });
      queryClient.invalidateQueries({ queryKey: ["client-projects"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'status-good';
      case 'ON_HOLD': return 'status-warning';
      case 'ONGOING': return 'bg-blue-100 text-blue-800';
      case 'PLANNED': return 'status-neutral';
      default: return 'status-neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return TrendingUp;
      case 'ON_HOLD': return AlertTriangle;
      case 'ONGOING': return TrendingUp;
      default: return Building2;
    }
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track the progress of your assigned projects.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details below to register a new construction project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    placeholder="e.g. Madurai Ring Road" required
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROAD">Road Construction</SelectItem>
                      <SelectItem value="WATER">Water Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="Location address" required
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Planned Start</Label>
                  <Input
                    type="date" required
                    value={formData.planned_start} onChange={(e) => setFormData({ ...formData, planned_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Planned End</Label>
                  <Input
                    type="date" required
                    value={formData.planned_end} onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expected End</Label>
                  <Input
                    type="date" required
                    value={formData.expected_end} onChange={(e) => setFormData({ ...formData, expected_end: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {projects?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No projects assigned.</p>
        ) : (
          projects?.map((project: any) => {
            const StatusIcon = getStatusIcon(project.status);

            return (
              <Card key={project.id} className="group hover:shadow-elevated transition-all">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[1fr,280px]">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            {project.type === 'WATER' ? <Droplets className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                            <span>{project.type}</span>
                          </div>
                          <h3 className="text-lg font-display font-semibold text-foreground">
                            {project.name}
                          </h3>
                        </div>
                        <Badge className={getStatusClass(project.status)} variant="outline">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">Construction project at {project.location}</p>

                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-muted-foreground font-medium">Overall Progress</p>
                          <span className="text-xs font-bold text-primary">{project.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l p-5 bg-muted/30 flex flex-col justify-between">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="flex items-center gap-1 text-foreground">
                            <MapPin className="h-3 w-3" />
                            {project.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Completion</p>
                          <p className="flex items-center gap-1 text-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.expected_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button className="mt-4 w-full gap-2" asChild>
                        <Link to={`/client/projects/${project.id}`}>
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}

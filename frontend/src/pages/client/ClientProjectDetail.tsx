import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  ImageIcon,
  FileText,
  User,
  Plus,
  Loader2,
  Bot,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function ClientProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    week_date: new Date().toISOString().split('T')[0],
    notes: "",
  });
  const [media, setMedia] = useState<File | null>(null);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const [projRes, progRes] = await Promise.all([
        api.get(`/client/projects/${id}`, { signal }),
        api.get(`/client/projects/${id}/progress`, { signal })
      ]);
      setProject(projRes.data.data);
      setProgress(progRes.data.data.timeline || []);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        toast({ title: "Error", description: "Failed to fetch project details", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [id, toast]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("week_date", formData.week_date);
      data.append("notes", formData.notes);
      if (media) data.append("media", media);

      const response = await api.post(`/client/projects/${id}/progress`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const estimate = response.data?.data?.imageAnalysis?.progress_estimate;
      const message = estimate !== undefined
        ? `Weekly progress uploaded. Estimated progress: ${estimate}%`
        : "Weekly progress uploaded.";

      toast({ title: "Update Added", description: message });
      setUploadDialogOpen(false);
      setFormData({ week_date: new Date().toISOString().split('T')[0], notes: "" });
      setMedia(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload progress", variant: "destructive" });
    }
  };

  const overallProgress = progress.length > 0 
    ? Math.min(100, Math.round((progress.reduce((sum, u) => sum + (parseFloat(u.actual_percent) || 0), 0) / progress.length) * 100) / 100)
    : 0;

  const generatePDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Project Progress Report", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Project: ${project.name}`, 20, 40);
    doc.text(`Location: ${project.location}`, 20, 50);
    doc.text(`Status: ${project.status}`, 20, 60);
    doc.text(`Progress: ${overallProgress}%`, 20, 70);

    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    // Updates
    doc.setFontSize(16);
    doc.text("Weekly Updates History", 20, 85);

    let y = 95;
    progress.slice().reverse().forEach((update, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Date: ${new Date(update.week_date).toLocaleDateString()} - Progress: ${update.actual_percent}%`, 20, y);
      doc.setFont("helvetica", "normal");
      const notes = doc.splitTextToSize(`Notes: ${update.notes || "No notes"}`, 160);
      doc.text(notes, 20, y + 5);
      y += 10 + (notes.length * 5);
    });

    doc.save(`${project.name}_Report.pdf`);
    toast({ title: "Report Generated", description: "Your PDF report has been downloaded." });
  };

  if (loading || !project) {
    return <div className="p-12 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/client/projects" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => generatePDF()} className="gap-2">
            <FileText className="h-4 w-4" />
            Report
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Update</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Weekly Progress Update</DialogTitle>
                <DialogDescription>
                  Upload a photo of the construction site to automatically estimate progress.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Week Ending Date</Label>
                    <Input
                      type="date" required
                      value={formData.week_date} onChange={(e) => setFormData({ ...formData, week_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Photo (used for AI progress estimation)</Label>
                    <Input
                      type="file" accept="image/*,video/*" required
                      onChange={(e) => setMedia(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The image will be analyzed to estimate progress. No need to enter progress manually.
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Update Notes</Label>
                  <Textarea
                    placeholder="Describe the work done this week..."
                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Upload Update</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            {project.type} Construction
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {project.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {project.location}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Est. {new Date(project.expected_end).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge className="bg-primary text-white text-sm px-3 py-1">
          <TrendingUp className="h-3.5 w-3.5 mr-1" />
          {project.status}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-primary text-lg">{overallProgress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Started: {new Date(project.planned_start).toLocaleDateString()}</span>
            <span>Expected: {new Date(project.expected_end).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates" className="gap-1 px-4">
            <Clock className="h-3.5 w-3.5" /> Updates
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1 px-4">
            <ImageIcon className="h-3.5 w-3.5" /> Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-4 space-y-4">
          {progress.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No weekly updates yet.</div>
          ) : (
            [...progress].reverse().map((update, idx) => (
              <Card key={update.id || idx}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Week Ending</p>
                      <p className="text-xs text-muted-foreground">{new Date(update.week_date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-primary font-bold">{update.actual_percent}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{update.notes}</p>
                  {update.media_url && (
                    <div className="mt-3 flex flex-col md:flex-row gap-4">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${update.media_url}`}
                        alt="Progress"
                        className="h-32 w-auto rounded-lg object-cover border"
                      />
                      {update.ai_analysis && (
                        <div className="flex-1 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <Bot className="h-3.5 w-3.5" /> AI Infrastructure Analysis
                          </div>
                          
                          <div className="space-y-2">
                            {(() => {
                              try {
                                const analysis = typeof update.ai_analysis === 'string' ? JSON.parse(update.ai_analysis) : update.ai_analysis;
                                if (!analysis) return null;
                                return (
                                  <>
                                    <div className="flex flex-wrap gap-1.5">
                                      {analysis.alerts?.map((alert: string, k: number) => (
                                        <Badge key={k} variant="secondary" className="text-[9px] py-0 h-4 font-medium bg-background border-primary/20 text-primary">
                                          {alert}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      {analysis.detected_objects?.slice(0, 2).map((obj: any, k: number) => (
                                        <div key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                          <ShieldCheck className="h-3 w-3 text-green-500" />
                                          <span className="font-semibold text-foreground">{obj.type}:</span> {obj.label}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                );
                              } catch (e) { return null; }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {progress.filter(p => p.media_url).map((update, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden border group">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${update.media_url}`}
                  alt="Gallery"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
            {progress.filter(p => p.media_url).length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No media uploaded yet.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

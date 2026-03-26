import { useState, useEffect } from "react";
import { Upload, ImageIcon, FileText, CheckCircle, Loader2, TrendingUp, Bot, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminUploadProgress() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    project_id: "",
    week_date: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [media, setMedia] = useState<File | null>(null);
  const [lastEstimate, setLastEstimate] = useState<number | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/admin/projects");
        setProjects(res.data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch projects", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      toast({ title: "Select Project", variant: "destructive" });
      return;
    }
    if (!media) {
      toast({ title: "Media Required", description: "Please upload a photo for AI progress analysis.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("week_date", formData.week_date);
      data.append("notes", formData.notes);
      data.append("media", media);

      const res = await api.post(`/admin/projects/${formData.project_id}/progress`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const estimate = res.data?.data?.actual_percent;
      const analysis = res.data?.data?.infraAnalysis;
      setLastEstimate(estimate);
      setLastAnalysis(analysis);
      
      toast({ 
        title: "Progress Uploaded", 
        description: `Analysis complete. Estimated Progress: ${estimate}%` 
      });
      
      setFormData({ ...formData, notes: "" });
      setMedia(null);
      // Reset file input manually if needed, but since it's a controlled component or handled by state it should be fine
    } catch (error: any) {
      const message = error.response?.data?.message || "Upload failed";
      const details = error.response?.data?.details;
      toast({ 
        title: "Upload Rejected", 
        description: details || message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">AI Progress Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit high-quality site photos for automated AI progress estimation.</p>
        </div>
        {lastEstimate !== null && (
          <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
            Last Estimate: {lastEstimate}%
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 border-muted shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Upload Site Update
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(val) => setFormData({ ...formData, project_id: val })}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Choose a project to update" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Update</Label>
                <Input 
                  type="date" 
                  required 
                  className="h-11"
                  value={formData.week_date} 
                  onChange={(e) => setFormData({ ...formData, week_date: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Details & Notes</Label>
                <Textarea 
                  placeholder="Describe the specific work completed this week..." 
                  rows={4} 
                  required 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                />
              </div>

              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                  <Upload className="h-4 w-4" /> 
                  Upload Site Photograph (Required)
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    required
                    onChange={(e) => setMedia(e.target.files?.[0] || null)}
                    className="bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Our AI vision model will analyze this image to calculate the actual completion percentage automatically. 
                  Ensure the photo clearly shows the current construction status.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 gap-2 text-base font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />}
                {isSubmitting ? "AI Analyzing Progress..." : "Analyze & Submit Update"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-muted shadow-sm h-fit">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">AI Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {!lastAnalysis ? (
                <div className="p-6 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-1">Waiting for Analysis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "Upload a site photograph to generate real-time infrastructure insights and progress estimation."
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                    <Bot className="h-4 w-4" /> Vision Analysis Reports
                  </div>
                  
                  {lastAnalysis.detected === "None" ? (
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                       <p className="text-sm text-foreground font-semibold">{lastAnalysis.message}</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Detection Category</p>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {lastAnalysis.detected}
                           </Badge>
                           <span className="text-xs text-muted-foreground font-medium">
                            {(lastAnalysis.detection_confidence * 100).toFixed(0)}% Conf.
                           </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-primary/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Construction Analysis</p>
                        <p className="text-xs text-foreground bg-muted/30 p-2 rounded italic leading-relaxed">
                          "{lastAnalysis.analysis}"
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-primary/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Status & Issues</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="outline" className={`text-[10px] ${lastAnalysis.progress === 'High' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                            Progress: {lastAnalysis.progress}
                          </Badge>
                          {lastAnalysis.issues?.length > 0 ? (
                            lastAnalysis.issues.map((issue: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                                {issue}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                              No issues detected
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Automated Progress Estimation</p>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm font-bold p-3 bg-primary/5 rounded-t-lg border-x border-t border-primary/10">
                            <span>Detected Completion</span>
                            <span className="text-primary text-lg">{lastEstimate}%</span>
                          </div>
                          <div className="text-[10px] text-center p-1 bg-primary/10 text-primary rounded-b-lg border-x border-b border-primary/10">
                            AI Confidence Score: {(lastAnalysis.progress_confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



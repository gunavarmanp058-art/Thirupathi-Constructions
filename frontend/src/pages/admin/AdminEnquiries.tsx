import { useState, useEffect } from "react";
import { Mail, Search, User, Phone, Building2, Calendar, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function AdminEnquiries() {
    const { toast } = useToast();
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/enquiries");
            setEnquiries(res.data.data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch enquiries", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await api.put(`/admin/enquiries/${id}`, { status: newStatus });
            toast({ title: "Status Updated", description: `Enquiry marked as ${newStatus.toLowerCase()}.` });
            fetchEnquiries();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const filtered = enquiries.filter(e =>
        (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.enquiry_type || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Public Enquiries</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage machinery rental requests and general contacts.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchEnquiries} disabled={loading} className="gap-2">
                    <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email or type..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((enquiry) => (
                                    <TableRow key={enquiry.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <User className="h-3 w-3 text-muted-foreground" /> {enquiry.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Mail className="h-3 w-3" /> {enquiry.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Phone className="h-3 w-3" /> {enquiry.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="text-[10px]">{enquiry.enquiry_type}</Badge>
                                                {enquiry.organization && (
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <Building2 className="h-3 w-3" /> {enquiry.organization}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm max-w-[200px] truncate" title={enquiry.message}>
                                                {enquiry.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    enquiry.status === "ACCEPTED" ? "status-good" :
                                                        enquiry.status === "REJECTED" ? "status-critical" : "status-warning"
                                                }
                                            >
                                                {enquiry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {enquiry.status === "PENDING" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                                            onClick={() => handleStatusUpdate(enquiry.id, 'ACCEPTED')}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleStatusUpdate(enquiry.id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {enquiry.status !== "PENDING" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-muted-foreground"
                                                        onClick={() => handleStatusUpdate(enquiry.id, 'PENDING')}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No enquiries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

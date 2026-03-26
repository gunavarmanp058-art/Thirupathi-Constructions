import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

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

export default function AdminBookingRequests() {
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [acceptData, setAcceptData] = useState({ from_date: new Date().toISOString().split("T")[0], to_date: "" });

  const fetchBookingRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/booking-requests");
      setBookingRequests(res.data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch booking requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    try {
      await api.post(`/admin/booking-requests/${selectedBooking.id}/accept`, acceptData);
      toast({ title: "Booking Accepted", description: `${selectedBooking.machine_name} has been booked for the client.` });
      setAcceptDialogOpen(false);
      setSelectedBooking(null);
      fetchBookingRequests();
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept booking", variant: "destructive" });
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to reject this booking request?")) return;
    try {
      await api.post(`/admin/booking-requests/${bookingId}/reject`);
      toast({ title: "Booking Rejected" });
      fetchBookingRequests();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject booking", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pending Machinery Booking Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve or reject client machine hire requests.</p>
        </div>
        <Badge variant="outline" className="bg-warning/10">
          {bookingRequests.filter((br) => br.status === "PENDING").length}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingRequests
                  .filter((br) => br.status === "PENDING")
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.client_name}</TableCell>
                      <TableCell>{request.machine_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{request.full_name}</p>
                          <p className="text-xs text-muted-foreground">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50">
                          PENDING
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog
                            open={acceptDialogOpen && selectedBooking?.id === request.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setSelectedBooking(request);
                                setAcceptData({ from_date: new Date().toISOString().split("T")[0], to_date: "" });
                              } else {
                                setAcceptDialogOpen(false);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-green-600 hover:text-green-700 border-green-200"
                                onClick={() => {
                                  setSelectedBooking(request);
                                  setAcceptDialogOpen(true);
                                }}
                              >
                                <Check className="h-4 w-4" /> Accept
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accept Booking Request</DialogTitle>
                                <DialogDescription>Confirm the dates for this machinery hire request.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-muted p-3 rounded">
                                  <p className="text-sm">
                                    <span className="font-semibold">Client:</span> {request.client_name}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold">Machine:</span> {request.machine_name}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold">Contact:</span> {request.full_name} ({request.phone})
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>From Date</Label>
                                    <Input
                                      type="date"
                                      value={acceptData.from_date}
                                      onChange={(e) => setAcceptData({ ...acceptData, from_date: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>To Date (Optional)</Label>
                                    <Input
                                      type="date"
                                      value={acceptData.to_date}
                                      onChange={(e) => setAcceptData({ ...acceptData, to_date: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleAcceptBooking} className="w-full">
                                  Confirm & Accept
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 hover:text-red-700 border-red-200"
                            onClick={() => handleRejectBooking(request.id)}
                          >
                            <X className="h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

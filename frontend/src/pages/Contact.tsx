import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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


const contactInfo = [
  {
    icon: MapPin,
    title: "Head Office",
    details: ["39-1/1, Kaveri Nagar,", "4th Cross Karur - 639003"],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 94432 59661"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["thiruppathi400@gmail.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 9:00 AM - 6:00 PM", "Sunday: Closed"],
  },
];

const enquiryTypes = [
  "Road Construction Project",
  "Water Pipeline Project",
  "Machinery Rental",
  "General Inquiry",
  "Career Opportunities",
  "Tender Information",
];

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    enquiryType: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!/^[A-Za-z\s]{3,}$/.test(formData.name)) {
      newErrors.name = "Name must be at least 3 characters and contain only letters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    if (!formData.enquiryType) {
      newErrors.enquiryType = "Please select an enquiry type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive"
      });
    }

    setIsSubmitting(true);

    try {
      await api.post("/public/enquiry", formData);

      toast({
        title: "Enquiry Submitted!",
        description: "Our team will contact you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        organization: "",
        enquiryType: "",
        message: "",
      });
      setErrors({});
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground section-padding !pb-32">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-primary-foreground/70 mb-4 text-sm font-medium">Contact Us</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Get In Touch
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Have a project in mind or need more information? Our team is ready
              to help you with your infrastructure requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards & Form */}
      <section className="relative -mt-20 pb-16 md:pb-24">
        <div className="container-wide">
          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {contactInfo.map((info, index) => (
              <Card
                key={info.title}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form & Map */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enquiry Form */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Send Us an Enquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        max={10}
                        className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        placeholder="Company/Department name"
                        value={formData.organization}
                        onChange={(e) => handleChange("organization", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiryType">Enquiry Type *</Label>
                    <Select
                      value={formData.enquiryType}
                      onValueChange={(value) => handleChange("enquiryType", value)}
                      required
                    >
                      <SelectTrigger className={errors.enquiryType ? "border-destructive focus-visible:ring-destructive" : ""}>
                        <SelectValue placeholder="Select enquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {enquiryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.enquiryType && <p className="text-[11px] text-destructive mt-1">{errors.enquiryType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project or enquiry..."
                      className={`min-h-[120px] ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                    />
                    {errors.message && <p className="text-[11px] text-destructive mt-1">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map Placeholder & Additional Info */}
            <div className="space-y-6 animate-fade-in animate-delay-200">
              {/* Map */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">
                      Interactive map will be displayed here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      39-1/1, Kaveri Nagar, Karur
                    </p>
                  </div>
                </div>
              </Card>

              {/* Why Contact Us */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Work With Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "25+ years of government project experience",
                    "Class A certified contractor",
                    "Transparent project tracking & reporting",
                    "AI-powered progress monitoring",
                    "Dedicated project manager for each client",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Offices */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Locations</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Regional Offices
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { city: "Coimbatore", address: "45 Industrial Area, RS Puram", phone: "+91 422 123 4567" },
              { city: "Madurai", address: "78 Temple Road, Anna Nagar", phone: "+91 452 987 6543" },
              { city: "Trichy", address: "23 Cantonment Road", phone: "+91 431 234 5678" },
            ].map((office, index) => (
              <Card key={office.city} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-foreground mb-2">{office.city}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{office.address}</p>
                  <a
                    href={`tel:${office.phone.replace(/\s/g, "")}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {office.phone}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

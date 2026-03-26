import { Settings, Bell, Shield, Globe, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure system preferences and notifications.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input defaultValue="Thirupathi Constructions" maxLength={100} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input defaultValue="thiruppathi400@gmail.com" type="email" maxLength={255} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 94432 59661" maxLength={20} />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Project delay alerts</p>
                <p className="text-xs text-muted-foreground">Get notified when projects are behind schedule</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Machine maintenance alerts</p>
                <p className="text-xs text-muted-foreground">Alerts for overdue maintenance</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly AI reports</p>
                <p className="text-xs text-muted-foreground">Auto-generated AI analysis every week</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New client registration</p>
                <p className="text-xs text-muted-foreground">Alert when a new client signs up</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">Application Version</p>
              <p className="text-xs text-muted-foreground">v1.0.0 - Frontend Only</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">Database Status</p>
              <p className="text-xs text-muted-foreground">Not connected (frontend mode)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">AI Module</p>
              <p className="text-xs text-muted-foreground">Mock data mode (backend required)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

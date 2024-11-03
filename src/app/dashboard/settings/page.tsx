import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/settings/profile-form";
import { AccountForm } from "@/components/settings/account-form";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Settings | BUF BARISTA CRM",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <PageContainer>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          <AccountForm />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm />
        </TabsContent>
      </Tabs>
    </div>
    </PageContainer>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    updateNotificationSettings,
    updatePrivacySettings,
    updateProfile,
    deleteUserAccount
} from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, User, Bell, Lock, Shield, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
    const { user, profile, settings, refreshProfile, refreshSettings } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Account section state
    const [username, setUsername] = useState(profile?.username || '');
    const [bio, setBio] = useState(profile?.bio || '');

    // Delete account state
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setBio(profile.bio || '');
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await updateProfile(supabase, { username, bio });
            await refreshProfile();
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleNotification = async (key: string, value: boolean) => {
        try {
            await updateNotificationSettings(supabase, { [key]: value });
            await refreshSettings();
            toast.success("Notification setting updated");
        } catch (error) {
            toast.error("Failed to update notification settings");
        }
    };

    const handleUpdatePrivacy = async (key: string, value: any) => {
        try {
            await updatePrivacySettings(supabase, { [key]: value });
            await refreshSettings();
            toast.success("Privacy setting updated");
        } catch (error) {
            toast.error("Failed to update privacy settings");
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        try {
            await deleteUserAccount(supabase);
            await supabase.auth.signOut();
            toast.success("Account deleted successfully");
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!settings || !profile) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and settings.</p>
            </div>

            <Tabs defaultValue="account" className="w-full grid md:grid-cols-[250px_1fr] gap-6 items-start">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0 justify-start">
                    {[
                        { value: 'account', label: 'Account', icon: User },
                        { value: 'notifications', label: 'Notifications', icon: Bell },
                        { value: 'privacy', label: 'Privacy', icon: Lock },
                        { value: 'security', label: 'Security', icon: Shield },
                        { value: 'danger', label: 'Danger Zone', icon: AlertCircle, className: 'text-red-500 hover:text-red-600' }
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={`w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-muted/50 data-[state=active]:text-primary transition-all border border-transparent data-[state=active]:border-border ${tab.className || ''}`}
                        >
                            <tab.icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex-1">
                    {/* Account Settings */}
                    <TabsContent value="account" className="mt-0 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Details</CardTitle>
                                <CardDescription>Update your account information and how others see you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={user?.email} disabled className="bg-muted/30" />
                                    <p className="text-xs text-muted-foreground italic">Email is managed via your authentication provider.</p>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                        />
                                        <p className="text-xs text-muted-foreground">This is your unique handle on the platform.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about yourself"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/10 pt-6">
                                <Button onClick={handleUpdateProfile} disabled={saving} className="ml-auto">
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Notifications */}
                    <TabsContent value="notifications" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Decide which activities you want to stay updated on.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'likes_enabled', label: 'Likes on my posts' },
                                    { key: 'comments_enabled', label: 'Comments on my posts' },
                                    { key: 'replies_enabled', label: 'Replies to my comments' },
                                    { key: 'contributions_enabled', label: 'Project contributions' },
                                    { key: 'system_enabled', label: 'System announcements' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                        <Label htmlFor={item.key} className="flex-1 cursor-pointer">{item.label}</Label>
                                        <Switch
                                            id={item.key}
                                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                                            onCheckedChange={(checked) => handleToggleNotification(item.key, checked)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy */}
                    <TabsContent value="privacy" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy & Visibility</CardTitle>
                                <CardDescription>Manage who can see your information and content.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Profile Visibility</Label>
                                        <p className="text-xs text-muted-foreground">Control who can discover your profile</p>
                                    </div>
                                    <Select
                                        value={settings.privacy.profile_visibility}
                                        onValueChange={(val) => handleUpdatePrivacy('profile_visibility', val)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public (Everyone)</SelectItem>
                                            <SelectItem value="limited">Limited (Followers only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="show_email" className="cursor-pointer">Show Email on Profile</Label>
                                        <Switch
                                            id="show_email"
                                            checked={settings.privacy.show_email}
                                            onCheckedChange={(checked) => handleUpdatePrivacy('show_email', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="allow_indexing" className="cursor-pointer">Search Engine Indexing</Label>
                                        <Switch
                                            id="allow_indexing"
                                            checked={settings.privacy.allow_indexing}
                                            onCheckedChange={(checked) => handleUpdatePrivacy('allow_indexing', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="allow_follow" className="cursor-pointer">Explicit Follow Requests</Label>
                                        <Switch
                                            id="allow_follow"
                                            checked={settings.privacy.allow_follow}
                                            onCheckedChange={(checked) => handleUpdatePrivacy('allow_follow', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security */}
                    <TabsContent value="security" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security & Access</CardTitle>
                                <CardDescription>Manage your authentication and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Session History</Label>
                                    <div className="rounded-md border p-4 text-sm text-muted-foreground bg-muted/20">
                                        Current Browser: {navigator.userAgent.split(')')[0]})
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">Sign out of all devices</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Danger Zone */}
                    <TabsContent value="danger" className="mt-0">
                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>Permanent and irreversible account actions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-foreground">Delete My Account</p>
                                            <p className="text-sm text-muted-foreground max-w-[400px]">
                                                Once you delete your account, there is no going back. All your posts, comments, and profile data will be permanently removed.
                                            </p>
                                        </div>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="group">
                                                    <Trash2 className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                                                    Delete Account
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription className="space-y-4">
                                                        <p>
                                                            This action cannot be undone. This will permanently delete your account
                                                            and all associated data from our servers.
                                                        </p>
                                                        <div className="flex items-center space-x-2 rounded-lg border p-4 bg-destructive/5">
                                                            <Checkbox
                                                                id="confirm-delete"
                                                                checked={deleteConfirm}
                                                                onCheckedChange={(checked) => setDeleteConfirm(checked as boolean)}
                                                            />
                                                            <label
                                                                htmlFor="confirm-delete"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                            >
                                                                I understand that this is irreversible and I want to delete my account.
                                                            </label>
                                                        </div>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setDeleteConfirm(false)}>Cancel</AlertDialogCancel>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteAccount}
                                                        disabled={!deleteConfirm || isDeleting}
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                        )}
                                                        Permanently Delete
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

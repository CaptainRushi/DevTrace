import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSettings, getUserSettings, updateUserSettings } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Settings, User, Bell, Lock, Palette, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!user) {
            // navigate('/auth/sign-in'); // Layout handles auth check usually, or we redirect
            return;
        }

        const fetchSettings = async () => {
            try {
                const data = await getUserSettings(supabase);
                // Ensure data is not null/undefined
                if (data) {
                    setSettings(data);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Settings fetch error:", error);
                setError(true);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user]);

    const handleUpdate = async (section: keyof UserSettings, key: string, value: any) => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [section]: {
                ...(settings[section] as object),
                [key]: value
            }
        };

        setSettings(newSettings);
        setSaving(true);
        try {
            await updateUserSettings(supabase, newSettings);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </>
        );
    }

    if (error || !settings) {
        return (
            <>
                <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <h3 className="text-lg font-semibold">Failed to load settings</h3>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </>
        );
    }

    return (
        <>
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
                            { value: 'appearance', label: 'Appearance', icon: Palette },
                            { value: 'security', label: 'Security', icon: Shield },
                            { value: 'danger', label: 'Danger Zone', icon: AlertCircle, className: 'text-red-500 hover:text-red-600' }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-muted ${tab.className || ''}`}
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
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your public profile details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={user?.email} disabled />
                                        <p className="text-xs text-muted-foreground">Managed via Auth provider</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <Input placeholder="username" defaultValue={user?.user_metadata?.username} disabled />
                                        <p className="text-xs text-muted-foreground">Contact support to change username.</p>
                                    </div>
                                    {/* Additional profile fields would go here, updating the 'profiles' table ideally */}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications */}
                        <TabsContent value="notifications" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Choose what you want to be notified about.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { key: 'likes', label: 'Likes on my posts' },
                                        { key: 'comments', label: 'Comments on my posts' },
                                        { key: 'replies', label: 'Replies to my comments' },
                                        { key: 'contributions', label: 'Project contributions' },
                                        { key: 'system', label: 'System announcements' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <Label htmlFor={item.key} className="flex-1">{item.label}</Label>
                                            <Switch
                                                id={item.key}
                                                checked={settings.notification_preferences[item.key as keyof typeof settings.notification_preferences]}
                                                onCheckedChange={(checked) => handleUpdate('notification_preferences', item.key, checked)}
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
                                    <CardTitle>Privacy</CardTitle>
                                    <CardDescription>Control your profile visibility.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Profile Visibility</Label>
                                            <p className="text-xs text-muted-foreground">Who can see your profile details</p>
                                        </div>
                                        <Select
                                            value={settings.privacy_preferences.profile_visibility}
                                            onValueChange={(val) => handleUpdate('privacy_preferences', 'profile_visibility', val)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="limited">Limited (Logged in only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="show_email">Show Email on Profile</Label>
                                        <Switch
                                            id="show_email"
                                            checked={settings.privacy_preferences.show_email}
                                            onCheckedChange={(checked) => handleUpdate('privacy_preferences', 'show_email', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="allow_messages">Allow Direct Messages</Label>
                                        <Switch
                                            id="allow_messages"
                                            checked={settings.privacy_preferences.allow_messages}
                                            onCheckedChange={(checked) => handleUpdate('privacy_preferences', 'allow_messages', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Appearance */}
                        <TabsContent value="appearance" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Theme</Label>
                                        <Select
                                            value={settings.appearance_preferences.theme}
                                            onValueChange={(val) => handleUpdate('appearance_preferences', 'theme', val)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Reduced Motion</Label>
                                            <p className="text-xs text-muted-foreground">Minimize animations</p>
                                        </div>
                                        <Switch
                                            checked={settings.appearance_preferences.reduced_motion}
                                            onCheckedChange={(checked) => handleUpdate('appearance_preferences', 'reduced_motion', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security */}
                        <TabsContent value="security" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Manage your session and access.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Active Sessions</Label>
                                        <div className="rounded-md border p-4 text-sm text-muted-foreground">
                                            Current session: {new Date().toLocaleString()} (Windows)
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">Sign out of all devices</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Danger Zone */}
                        <TabsContent value="danger" className="mt-0">
                            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                                <CardHeader>
                                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                    <CardDescription>Irreversible actions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-foreground">Delete Account</p>
                                                <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
                                            </div>
                                            <Button variant="destructive">Delete Account</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </>
    );
}

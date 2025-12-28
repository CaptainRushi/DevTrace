
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/services/api";

interface EditProfileDialogProps {
    currentProfile: any;
    onProfileUpdate: (newUsername?: string) => void;
    children?: React.ReactNode;
}

export function EditProfileDialog({ currentProfile, onProfileUpdate, children }: EditProfileDialogProps) {
    const { user, refreshProfile } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState(currentProfile?.username || "");
    const [bio, setBio] = useState(currentProfile?.bio || "");
    // Using comma separated string for simple tag management
    const [skills, setSkills] = useState(currentProfile?.skills?.join(", ") || "");
    const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [bannerUrl, setBannerUrl] = useState(currentProfile?.bannerUrl || currentProfile?.banner || "");
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validation: Size <= 300KB
            if (file.size > 300 * 1024) {
                toast.error("Avatar must be under 300KB");
                return;
            }

            // Validation: Type
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error("Only PNG, JPG, and WebP formats are allowed");
                return;
            }

            setAvatarFile(file);
            // Create preview
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 200 * 1024) { // 200KB limit for banner
                toast.error("Banner must be under 200KB");
                return;
            }

            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error("Only PNG, JPG, and WebP formats are allowed");
                return;
            }

            setBannerFile(file);
            setBannerUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            let uploadedAvatarUrl = currentProfile?.avatar_url;

            // 1. Upload Avatar if changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `avatar.${fileExt}`; // Keeping it simple to overwrite
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                uploadedAvatarUrl = publicUrl;
            }

            // Start with existing path
            let uploadedBannerPath = currentProfile?.banner_path;

            // 2. Upload Banner if changed
            if (bannerFile) {
                const fileExt = bannerFile.name.split('.').pop();
                const fileName = `banner_${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, bannerFile, { upsert: true });

                if (uploadError) throw uploadError;

                // Save only the path, not the full URL
                uploadedBannerPath = filePath;
            }

            // 2. Update Profile via Unified API
            const skillArray = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);

            await updateProfile(supabase, {
                username,
                bio,
                skills: skillArray,
                avatar_url: uploadedAvatarUrl,
                banner_path: uploadedBannerPath
            });

            await refreshProfile();

            toast.success("Profile updated successfully!");
            onProfileUpdate(username);
            setOpen(false);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : <Button variant="outline">Edit Profile</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="grid gap-4 py-4">

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                            <img
                                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> Upload Avatar (Max 300KB)
                            </Button>
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <Label>Banner Image</Label>
                        <div className="relative h-24 w-full rounded-md overflow-hidden border bg-muted">
                            {bannerUrl ? (
                                <img
                                    src={bannerUrl}
                                    alt="Banner"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Banner
                                </div>
                            )}
                        </div>
                        <div>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                ref={bannerInputRef}
                                onChange={handleBannerChange}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => bannerInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> Upload Banner (Max 200KB)
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="col-span-3"
                            maxLength={200}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="skills" className="text-right">
                            Skills
                        </Label>
                        <Input
                            id="skills"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="col-span-3"
                            placeholder="React, TypeScript, Node.js (comma separated)"
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

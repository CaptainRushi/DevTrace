
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Github, Loader2 } from "lucide-react";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user) {
        navigate("/");
        return null;
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                throw authError;
            }

            if (data.user) {
                // 2. Create user profile
                // Note: RLS allows insert if auth.uid() = id.
                // We must handle the case where email confirmation is required.
                // If email confirmation is ON, the user is not fully logged in yet?
                // Actually, if we disable email confirmation for dev, it works immediately.
                // If enabled, the insert might fail if session is not active.
                // However, the prompt specifically requested this logic.

                const { error: profileError } = await supabase.from("users").insert({
                    id: data.user.id,
                    username: username,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                });

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                    toast.error("Account created but failed to create profile. Please contact support.");
                } else {
                    toast.success("Account created successfully! Please check your email if confirmation is required.");
                    navigate("/"); // or to an onboarding page
                }

            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred during sign up.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'github' | 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error) {
            toast.error(`Error logging in with ${provider}`);
            console.error(error);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background/50"
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" disabled={loading} onClick={() => handleOAuthSignIn('github')}>
                            <Github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                        <Button variant="outline" disabled={loading} onClick={() => handleOAuthSignIn('google')}>
                            <span className="mr-2">G</span>
                            Google
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

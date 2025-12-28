
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserSettings, getUserSettings } from "@/services/api";

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: any | null;
    settings: UserSettings | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    refreshSettings: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    settings: null,
    loading: true,
    refreshProfile: async () => { },
    refreshSettings: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    };

    const fetchSettings = async () => {
        const data = await getUserSettings(supabase);
        if (data) {
            setSettings(data);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSettings();
            }
            setLoading(false);
        });

        // Listen for changes on auth state (sing in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSettings();
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const refreshSettings = async () => {
        if (user) await fetchSettings();
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, settings, loading, refreshProfile, refreshSettings }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

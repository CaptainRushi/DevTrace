import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GuestAccessPrompt = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-gradient-to-b from-primary/5 to-transparent p-12 text-center"
        >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Discover More on DevTrace</h3>
            <p className="mx-auto mt-3 max-w-[280px] text-muted-foreground">
                Sign in to explore unlimited posts, join discussions, and start building your developer profile. 🚀
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/auth/sign-in">
                    <Button size="lg" className="min-w-[140px] gap-2">
                        Sign In
                    </Button>
                </Link>
                <Link to="/auth/sign-up">
                    <Button variant="outline" size="lg" className="min-w-[140px] gap-2">
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
};

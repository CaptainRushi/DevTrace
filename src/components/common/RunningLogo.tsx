import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RunningLogoProps {
    className?: string;
    collapsed?: boolean;
}

export const RunningLogo: React.FC<RunningLogoProps> = ({
    className,
    collapsed = false,
}) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/')}
            className={cn(
                "relative flex items-center gap-2 cursor-pointer select-none group px-2 py-1 rounded-lg transition-all duration-300 hover:bg-muted/50",
                className
            )}
            role="banner"
            aria-label="DevTrace Home"
        >
            {/* Logo Image */}
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-card shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <img
                    src="/logo.png"
                    alt="DevTrace Logo"
                    className="h-full w-full object-cover p-1"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
            </div>

            {/* Logo Text */}
            <div className={cn(
                "font-jersey font-normal text-primary flex items-center justify-center relative transition-all duration-300",
                "text-3xl leading-none tracking-wide whitespace-nowrap",
                collapsed ? "hidden md:flex" : "flex"
            )}>
                DevTrace
            </div>
        </div>
    );
};

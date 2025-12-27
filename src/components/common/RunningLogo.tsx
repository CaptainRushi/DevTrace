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
                "relative flex items-center justify-center cursor-pointer select-none group",
                className
            )}
            role="banner"
            aria-label="DevTrace Home"
            style={{ perspective: '1000px' }}
        >
            <div className={cn(
                "relative transition-all duration-300 transform-style-3d",
                "motion-safe:animate-logo-3d-float"
            )}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Main Text Layer */}
                <div className={cn(
                    "font-jersey font-normal text-primary flex items-center justify-center relative",
                    "text-4xl leading-none tracking-wide whitespace-nowrap",
                    collapsed ? "text-4xl" : "text-4xl" // Maintained consistent size as requested
                )}>
                    DevTrace

                    {/* Light Sweep Overlay (Simulates reflection) */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full motion-safe:animate-light-sweep" />
                    </div>
                </div>
            </div>
        </div>
    );
};

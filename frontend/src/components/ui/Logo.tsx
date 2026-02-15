import React from 'react';
import { BRANDING } from '../../config/branding';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    size = 'md',
    showText = true,
    iconOnly = false
}) => {
    const sizeMap = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-14 w-14'
    };

    const textSizeMap = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-4xl'
    };

    const iconPaddingMap = {
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-2',
        xl: 'p-3'
    };

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* Icon/Symbol: Stylized "S" or Lightning Bolt for Speed/Market */}
            <div className={`shrink-0 ${sizeMap[size]} bg-primary rounded-xl flex items-center justify-center ${iconPaddingMap[size]} shadow-lg shadow-primary/20 transform hover:scale-105 transition-transform duration-300`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-primary-foreground"
                >
                    <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {!iconOnly && showText && (
                <span className={`font-extrabold tracking-tighter text-foreground leading-none ${textSizeMap[size]}`}>
                    {BRANDING.appName.split(' ')[0]}
                    {BRANDING.appName.split(' ').length > 1 && (
                        <span className="text-primary italic"> {BRANDING.appName.split(' ').slice(1).join(' ')}</span>
                    )}
                </span>
            )}
        </div>
    );
};

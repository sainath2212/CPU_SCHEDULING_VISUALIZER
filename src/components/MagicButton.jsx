import React from "react";

export function MagicButton({ children, onClick, className = "", innerClassName = "", disabled = false, title = "", type = "button" }) {
    const roundedClass = className.split(' ').find(c => c.startsWith('rounded-')) || 'rounded-full';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`relative inline-flex overflow-hidden p-[1px] focus:outline-none transition-transform active:scale-[0.98] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className.includes('rounded-') ? '' : 'rounded-full'} ${className}`}
        >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E64833_0%,#B0B0B0_50%,#E64833_100%)]" />
            <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center bg-[#121212] font-medium text-[#E0E0E0] backdrop-blur-3xl transition-colors hover:bg-[#1a1a1a] ${roundedClass} ${innerClassName || 'px-5 py-2 text-sm'}`}>
                {children}
            </span>
        </button>
    );
}

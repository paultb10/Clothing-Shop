import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function Button({ children, className, ...props }: ButtonProps) {
    return (
        <button
            className={`px-4 py-2 rounded-xl text-white font-semibold transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
            {...props}
        />
    );
}

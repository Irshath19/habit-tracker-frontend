import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
    destructive: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30',
    outline: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
    icon: 'p-2.5',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

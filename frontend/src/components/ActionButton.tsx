import React from 'react';

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  label, 
  icon, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = ""
}) => {
  const baseStyles = "px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[3px] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
};

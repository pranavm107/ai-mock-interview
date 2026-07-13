import React from 'react';

interface Props {
  company: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CompanyLogo: React.FC<Props> = ({ company, size = 'md', className = '' }) => {
  const normalizedName = company?.toLowerCase().trim() || '';

  const getCompanyStyle = () => {
    switch (normalizedName) {
      case 'google':
        return { bg: 'bg-white', border: 'border-slate-200', text: 'text-red-500', char: 'G', gradient: false };
      case 'microsoft':
        return { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-white', char: 'M', gradient: false };
      case 'amazon':
        return { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-orange-500', char: 'a', gradient: false };
      case 'meta':
      case 'facebook':
        return { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', char: 'M', gradient: false };
      case 'apple':
        return { bg: 'bg-black', border: 'border-gray-800', text: 'text-white', char: '', gradient: false };
      case 'netflix':
        return { bg: 'bg-black', border: 'border-red-900', text: 'text-red-600', char: 'N', gradient: false };
      case 'stripe':
        return { bg: 'bg-indigo-600', border: 'border-indigo-700', text: 'text-white', char: 'S', gradient: false };
      case 'adobe':
        return { bg: 'bg-red-600', border: 'border-red-700', text: 'text-white', char: 'A', gradient: false };
      case 'ibm':
        return { bg: 'bg-blue-800', border: 'border-blue-900', text: 'text-white', char: 'IBM', gradient: false };
      case 'intel':
        return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', char: 'intel', gradient: false };
      case 'nvidia':
        return { bg: 'bg-green-600', border: 'border-green-700', text: 'text-white', char: 'NV', gradient: false };
      case 'oracle':
        return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white', char: 'O', gradient: false };
      case 'cisco':
        return { bg: 'bg-sky-500', border: 'border-sky-600', text: 'text-white', char: 'C', gradient: false };
      case 'salesforce':
        return { bg: 'bg-sky-400', border: 'border-sky-500', text: 'text-white', char: 'Sf', gradient: false };
      case 'infosys':
        return { bg: 'bg-blue-700', border: 'border-blue-800', text: 'text-white', char: 'Inf', gradient: false };
      case 'tcs':
        return { bg: 'bg-slate-800', border: 'border-slate-900', text: 'text-blue-400', char: 'TCS', gradient: false };
      case 'wipro':
        return { bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-white', char: 'W', gradient: false };
      case 'accenture':
        return { bg: 'bg-purple-600', border: 'border-purple-700', text: 'text-white', char: '>', gradient: false };
      case 'cognizant':
        return { bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-white', char: 'C', gradient: false };
      case 'capgemini':
        return { bg: 'bg-cyan-600', border: 'border-cyan-700', text: 'text-white', char: 'Cap', gradient: false };
      case 'zoho':
        return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-yellow-300', char: 'Z', gradient: false };
      case 'freshworks':
        return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white', char: 'F', gradient: false };
      case 'evolvex ai':
      case 'evolvex':
        return { bg: 'bg-gradient-to-tr from-blue-600 to-purple-600', border: 'border-purple-300', text: 'text-white', char: 'EX', gradient: true };
      default:
        // Fallback random-ish color based on first letter
        const firstLetter = company ? company.charAt(0).toUpperCase() : '?';
        return { bg: 'bg-gradient-to-br from-slate-100 to-slate-200', border: 'border-slate-300', text: 'text-slate-600', char: firstLetter, gradient: true };
    }
  };

  const style = getCompanyStyle();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-4xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${style.bg} ${style.border} ${style.text} flex items-center justify-center font-bold rounded-2xl shadow-sm border ${className}`}
      title={company}
    >
      <span className={style.gradient ? 'drop-shadow-sm' : ''}>{style.char}</span>
    </div>
  );
};

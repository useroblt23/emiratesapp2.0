import { ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface PremiumCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  locked?: boolean;
  className?: string;
}

export default function PremiumCard({ 
  title, 
  icon, 
  children, 
  locked = false, 
  className = '' 
}: PremiumCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
      locked ? 'opacity-75' : ''
    } ${
      !locked ? 'border-2 border-[#C8A14B]' : 'border border-gray-200'
    } ${className}`}>
      {locked && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">Premium Feature</p>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${
            locked ? 'bg-gray-200' : 'bg-gradient-to-r from-[#C8A14B] to-[#D4AF37]'
          }`}>
            <div className={locked ? 'text-gray-400' : 'text-white'}>
              {icon}
            </div>
          </div>
          <h3 className={`text-xl font-bold ${
            locked ? 'text-gray-400' : 'text-[#2C2C2C]'
          }`}>
            {title}
          </h3>
        </div>
        
        <div className={locked ? 'blur-sm' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
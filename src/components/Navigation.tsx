import { Home, Users, MessageCircle, Shirt, User, Star } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'recruitment', icon: Users, label: 'Stages' },
    { id: 'interview', icon: MessageCircle, label: 'Q&A' },
    { id: 'dress', icon: Shirt, label: 'Dress' },
    { id: 'onestep', icon: Star, label: 'Premium' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 overflow-x-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center h-16 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isPremium = item.id === 'onestep';
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition relative ${
                  isActive
                    ? isPremium ? 'text-[#C8A14B]' : 'text-[#D71920]'
                    : 'text-gray-500 hover:text-[#2C2C2C]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C8A14B] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

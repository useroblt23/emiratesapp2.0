interface ProgressTrackerProps {
  progress: number;
  label?: string;
}

export default function ProgressTracker({ progress, label = "Your training progress" }: ProgressTrackerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[#2C2C2C]">{label}</h3>
        <span className="text-[#C8A14B] font-bold text-xl">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] h-4 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-gray-600 text-sm mt-2">
        Keep going! You're making excellent progress.
      </p>
    </div>
  );
}
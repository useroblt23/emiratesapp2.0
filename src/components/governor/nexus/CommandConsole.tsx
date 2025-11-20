import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface CommandResponse {
  success: boolean;
  message: string;
  timestamp: Date;
}

export default function CommandConsole() {
  const { currentUser } = useApp();
  const [command, setCommand] = useState('');
  const [responses, setResponses] = useState<CommandResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const isGovernor = currentUser?.role === 'governor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !isGovernor) return;

    setLoading(true);

    try {
      const commandResponse: CommandResponse = {
        success: true,
        message: `Command "${command}" received. Cloud Function integration pending.`,
        timestamp: new Date(),
      };

      setResponses((prev) => [commandResponse, ...prev]);
      setCommand('');
    } catch (error) {
      const errorResponse: CommandResponse = {
        success: false,
        message: `Error executing command: ${error}`,
        timestamp: new Date(),
      };
      setResponses((prev) => [errorResponse, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass-light rounded-xl shadow-lg p-3 md:p-6 border-2 border-transparent hover:border-gray-200 transition overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Terminal className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
        <h2 className="text-base md:text-xl font-bold text-gray-900 tracking-tight">Command Console</h2>
        {!isGovernor && (
          <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full uppercase tracking-wide font-bold border border-yellow-300 flex-shrink-0">
            View Only
          </span>
        )}
      </div>

      {!isGovernor && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            Sub-governors can view console logs but cannot execute commands.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={isGovernor ? "/shutdown chat" : "Command disabled"}
            disabled={!isGovernor || loading}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-gray-900 text-green-400 font-mono text-xs md:text-sm rounded-lg border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D71920] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isGovernor || loading || !command.trim()}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-lg text-sm font-bold hover:from-[#B91518] hover:to-[#A01315] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md uppercase tracking-wide"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            )}
            <span className="hidden sm:inline">Execute</span>
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {responses.length === 0 ? (
          <div className="text-center py-8 glass-light rounded-xl border-2 border-gray-200">
            <Terminal className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No commands executed yet</p>
            <p className="text-xs text-gray-500 mt-1">Commands: /shutdown, /disable, /lock, /downgrade</p>
          </div>
        ) : (
          responses.map((response, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border-2 ${
                response.success
                  ? 'bg-green-50 border-green-300'
                  : 'bg-[#D71920]/10 border-red-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${
                  response.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {response.success ? 'SUCCESS' : 'ERROR'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{response.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {response.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Cloud Function endpoint (/runGovernorCommand) needs to be implemented for live command execution.
        </p>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, User, Calendar, ArrowUp, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  getAllBugReports,
  getBugReportsByRole,
  updateBugReportStatus,
  escalateBugReport,
  addResponseToBugReport,
  BugReport,
  BugStatus
} from '../../../services/bugReportService';

export default function BugReportsManager() {
  const { currentUser } = useApp();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    loadReports();
  }, [currentUser]);

  const loadReports = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const fetchedReports = await getBugReportsByRole(currentUser.role);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error loading bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: BugStatus) => {
    try {
      await updateBugReportStatus(reportId, newStatus, currentUser?.uid, currentUser?.name);
      await loadReports();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleEscalate = async (reportId: string) => {
    if (!currentUser) return;

    try {
      await escalateBugReport(reportId, currentUser.uid, currentUser.name);
      await loadReports();
      alert('Bug report escalated to Governor!');
    } catch (error) {
      console.error('Error escalating bug:', error);
      alert('Failed to escalate bug report');
    }
  };

  const handleAddResponse = async () => {
    if (!selectedReport || !responseMessage.trim() || !currentUser) return;

    try {
      await addResponseToBugReport(selectedReport.id!, {
        id: Date.now().toString(),
        userId: currentUser.uid,
        userName: currentUser.name,
        userRole: currentUser.role,
        message: responseMessage.trim(),
        createdAt: new Date()
      });

      setResponseMessage('');
      await loadReports();
      const updatedReport = reports.find(r => r.id === selectedReport.id);
      if (updatedReport) setSelectedReport(updatedReport);
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Failed to add response');
    }
  };

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'escalated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-slate-100">Bug Reports</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No bug reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(report.priority)}`}>
                      {report.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded border text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                    {report.escalatedToGovernor && (
                      <span className="px-2 py-1 rounded bg-purple-600 text-white text-xs font-bold">
                        ESCALATED
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-300 line-clamp-2 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{report.reportedByName} ({report.reportedByRole})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-600 rounded">{report.category}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {currentUser?.role === 'governor' && report.status !== 'closed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(report.id!, 'closed');
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Close
                    </button>
                  )}
                  {currentUser?.role === 'mentor' && !report.escalatedToGovernor && report.status !== 'resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEscalate(report.id!);
                      }}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                    >
                      <ArrowUp className="w-3 h-3" />
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-700 p-6 border-b border-slate-600">
              <h3 className="text-2xl font-bold text-slate-100">{selectedReport.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(selectedReport.priority)}`}>
                  {selectedReport.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded border text-xs font-semibold ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2">Description</h4>
                <p className="text-slate-100">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Reported by:</span>
                  <p className="text-slate-100 font-semibold">{selectedReport.reportedByName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="text-slate-100 font-semibold">{selectedReport.category}</p>
                </div>
              </div>

              {selectedReport.responses && selectedReport.responses.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Responses ({selectedReport.responses.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedReport.responses.map((response) => (
                      <div key={response.id} className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-100">{response.userName}</span>
                          <span className="text-xs text-slate-400">
                            {response.createdAt?.toDate?.()?.toLocaleString?.() || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2">Add Response</h4>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:border-slate-500 focus:outline-none resize-none"
                />
                <button
                  onClick={handleAddResponse}
                  disabled={!responseMessage.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send Response
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

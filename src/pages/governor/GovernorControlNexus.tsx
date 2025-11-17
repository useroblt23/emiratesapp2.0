import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import MetricsCards from '../../components/governor/nexus/MetricsCards';
import RealtimeLogs from '../../components/governor/nexus/RealtimeLogs';
import CommandConsole from '../../components/governor/nexus/CommandConsole';
import BackupControl from '../../components/governor/nexus/BackupControl';
import AIAssistantPanel from '../../components/governor/nexus/AIAssistantPanel';
import AILogsViewer from '../../components/governor/nexus/AILogsViewer';
import UserManager from '../../components/governor/nexus/UserManager';
import SystemFlags from '../../components/governor/nexus/SystemFlags';
import CourseManager from '../../components/governor/nexus/CourseManager';
import SupportChatManager from '../../components/governor/nexus/SupportChatManager';
import FinancePanel from '../../components/governor/nexus/FinancePanel';
import AnnouncementManager from './AnnouncementManager';
import BugReportsManager from '../../components/governor/nexus/BugReportsManager';
import ModuleManager from '../../components/governor/nexus/ModuleManager';
import DataInitializer from '../../components/governor/nexus/DataInitializer';

interface Announcement {
  active: boolean;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: any;
}

export default function GovernorControlNexus() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const announcementDoc = await getDoc(doc(db, 'systemControl', 'status'));
        if (announcementDoc.exists()) {
          const data = announcementDoc.data();
          if (data?.announcement?.active) {
            setAnnouncement(data.announcement as Announcement);
          }
        }
      } catch (error) {
        console.error('Error loading announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, []);

  const getBannerColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-900 border-yellow-700 text-yellow-100';
      case 'error':
        return 'bg-red-900 border-red-700 text-red-100';
      case 'success':
        return 'bg-green-900 border-green-700 text-green-100';
      default:
        return 'bg-blue-900 border-blue-700 text-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {!loading && announcement && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-b ${getBannerColor(announcement.type)} px-6 py-3`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-semibold">{announcement.message}</p>
          </div>
        </motion.div>
      )}

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Governor Control Nexus</h1>
              <p className="text-slate-400 text-sm mt-1">Central command system for platform management</p>
            </div>
          </div>
        </motion.div>

        <MetricsCards />

        <FinancePanel />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeLogs />
          <CommandConsole />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BackupControl />
          <DataInitializer />
        </div>

        <AIAssistantPanel />

        <AILogsViewer />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserManager />
          <SystemFlags />
        </div>

        <CourseManager />

        <AnnouncementManager />

        <BugReportsManager />

        <ModuleManager />

        <SupportChatManager />
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Shield, AlertCircle, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

interface DashboardMetrics {
  currentMRR: string;
  currentCustomers: number;
  activeCustomers: number;
  churnRate: number;
  totalTransactions: number;
  supportTickets: {
    all: number;
    open: number;
    pending: number;
    closed: number;
  };
}

export default function GovernorControlNexus() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    currentMRR: '$12.4k',
    currentCustomers: 16601,
    activeCustomers: 33,
    churnRate: 2,
    totalTransactions: 342,
    supportTickets: {
      all: 4,
      open: 1,
      pending: 2,
      closed: 1
    }
  });

  const [trendData] = useState([
    { month: 'Jan', value: 78 },
    { month: 'Feb', value: 95 },
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 82 },
    { month: 'May', value: 110 },
    { month: 'Jun', value: 88 },
    { month: 'Jul', value: 105 }
  ]);

  const [salesData] = useState([
    { label: 'Mastercard', value: 35, color: '#2b4162' },
    { label: 'VISA A/c', value: 25, color: '#3e000c' },
    { label: 'Invoices flow', value: 40, color: '#e71d36' }
  ]);

  const [transactionData] = useState([
    { type: 'Withdraw', count: 145, change: 12 },
    { type: 'Refund', count: 89, change: -8 },
    { type: 'Pending', count: 67, change: 5 },
    { type: 'Hardware', count: 34, change: 3 },
    { type: 'Transfer', count: 23, change: -4 },
    { type: 'Fund', count: 87, change: 15 },
    { type: 'Sector', count: 56, change: 7 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const announcementDoc = await getDoc(doc(db, 'systemControl', 'status'));
        if (announcementDoc.exists()) {
          const data = announcementDoc.data();
          if (data?.announcement?.active) {
            setAnnouncement(data.announcement as Announcement);
          }
        }

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const currentCustomers = usersSnapshot.size;

        const activeQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        );
        const activeSnapshot = await getDocs(activeQuery);
        const activeCustomers = activeSnapshot.size;

        setMetrics(prev => ({
          ...prev,
          currentCustomers,
          activeCustomers: Math.round((activeCustomers / currentCustomers) * 100)
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const maxTrendValue = Math.max(...trendData.map(d => d.value));

  return (
    <div className="min-h-screen">
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

      <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
          style={{background: 'rgba(62, 0, 12, 0.15)', backdropFilter: 'blur(40px)'}}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background: 'var(--primary-glass)', backdropFilter: 'blur(24px)'}}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Governor Control Nexus</h1>
              <p className="text-white/70 text-sm mt-1">Central command system for platform management</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 parallax-hover"
            style={{background: 'var(--yale-glass)', backdropFilter: 'blur(24px)'}}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white font-medium">Current MRR</p>
            </div>
            <p className="text-4xl font-bold text-white">{metrics.currentMRR}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 parallax-hover"
            style={{background: 'var(--jasmine-glass)', backdropFilter: 'blur(24px)'}}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-800 font-medium">Current Customers</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">{metrics.currentCustomers.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 parallax-hover"
            style={{background: 'var(--primary-glass)', backdropFilter: 'blur(24px)'}}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white font-medium">Active Customers</p>
            </div>
            <p className="text-4xl font-bold text-white">{metrics.activeCustomers}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 parallax-hover"
            style={{background: 'var(--primary-glass-hover)', backdropFilter: 'blur(24px)'}}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white font-medium">Churn Rate</p>
            </div>
            <p className="text-4xl font-bold text-white">{metrics.churnRate}%</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-card p-6"
            style={{background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(40px)'}}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Trend</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#e71d36]"></div>
                  <span className="text-white/80">Inbound</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/50"></div>
                  <span className="text-white/80">Outbound</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <span className="text-white/80">Grow</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
              {trendData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-white/20 rounded-t-lg" style={{height: `${(data.value / maxTrendValue) * 100}%`}}>
                    <div className="w-full h-full bg-[#e71d36] rounded-t-lg"></div>
                  </div>
                  <span className="text-xs text-white/80">{data.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
            style={{background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(40px)'}}
          >
            <h2 className="text-xl font-bold text-white mb-6">Sales</h2>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="transform -rotate-90 w-full h-full">
                {salesData.reduce((acc, item, index) => {
                  const previousTotal = salesData.slice(0, index).reduce((sum, d) => sum + d.value, 0);
                  const circumference = 2 * Math.PI * 70;
                  const offset = (previousTotal / 100) * circumference;
                  const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;

                  return [...acc, (
                    <circle
                      key={index}
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="40"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  )];
                }, [] as JSX.Element[])}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{metrics.totalTransactions}</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {salesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-white/80">{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
            <button className="glass-button-primary w-full mt-6 px-4 py-3 text-white font-semibold text-sm">
              View all transactions
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
            style={{background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(40px)'}}
          >
            <h2 className="text-xl font-bold text-white mb-6">Transactions</h2>
            <div className="space-y-3">
              {transactionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#e71d36]"></div>
                    <span className="text-sm font-medium text-white">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-white">{item.count}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.change > 0 ? 'bg-green-500/30 text-white' : 'bg-red-500/30 text-white'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-6"
            style={{background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(40px)'}}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Support Tickets</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-semibold rounded-full bg-[#e71d36] text-white">
                  All
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded-full glass-button-secondary text-white">
                  Open
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded-full glass-button-secondary text-white">
                  Pending
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded-full glass-button-secondary text-white">
                  Closed
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { email: 'trisha.wilt72@yandrex.com', issue: 'Login Issue', priority: 'HIGH' },
                { email: 'dane.sert964@yandex.com', issue: 'Billing inquiry', priority: 'LOW' },
                { email: 'amy.smit11@8f6r59dcaus.uk', issue: 'Product Malfunction', priority: 'MEDIUM' },
                { email: 'yandeyp.innov@0w44tyfiv.org', issue: 'Feature Request', priority: 'LOW' }
              ].map((ticket, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#e71d36]"></div>
                    <div>
                      <p className="text-sm font-medium text-white">{ticket.email}</p>
                      <p className="text-xs text-white/70">{ticket.issue}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    ticket.priority === 'HIGH' ? 'bg-[#e71d36] text-white' :
                    ticket.priority === 'MEDIUM' ? 'bg-[#ffe882] text-gray-900' :
                    'bg-white/20 text-white'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <MetricsCards />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <UserManager />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <SystemFlags />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <CourseManager />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <ModuleManager />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <SupportChatManager />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <BugReportsManager />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <AIAssistantPanel />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <CommandConsole />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <AILogsViewer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
        >
          <FinancePanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
        >
          <AnnouncementManager />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1 }}
          >
            <BackupControl />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <DataInitializer />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3 }}
        >
          <RealtimeLogs />
        </motion.div>
      </div>
    </div>
  );
}

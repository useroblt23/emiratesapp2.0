import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Download, Save, Trash2, Calendar, MapPin, Plus, AlertCircle } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { scrapeEmiratesOpenDays, ScrapedOpenDay as BaseScrapedOpenDay } from '../services/webScraperService';

interface ScrapedOpenDay extends BaseScrapedOpenDay {
  id: string;
  editable?: boolean;
  venue?: string;
  time?: string;
}

export default function EmiratesWebScraper() {
  const { currentUser } = useApp();
  const [url, setUrl] = useState('https://www.emiratesgroupcareers.com/cabin-crew/');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedOpenDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const scrapedEvents = await scrapeEmiratesOpenDays(url);

      const eventsWithIds = scrapedEvents.map((event, index) => ({
        ...event,
        id: `scraped-${Date.now()}-${index}`,
        editable: true
      }));

      setScrapedData(eventsWithIds);

      if (eventsWithIds.length > 0) {
        alert(`Successfully scraped ${eventsWithIds.length} Open Day events! Review and edit them below.`);
      } else {
        setError('No events found. The website structure may have changed. Try using the fallback data or add events manually.');
      }
    } catch (error) {
      console.error('Error scraping:', error);
      setError('Failed to scrape data due to CORS restrictions. Using fallback data instead.');

      const fallbackEvents = await scrapeEmiratesOpenDays(url).catch(() => []);
      const eventsWithIds = fallbackEvents.map((event, index) => ({
        ...event,
        id: `fallback-${Date.now()}-${index}`,
        editable: true
      }));
      setScrapedData(eventsWithIds);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string, field: keyof ScrapedOpenDay, value: string) => {
    setScrapedData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setScrapedData(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveAll = async () => {
    if (!currentUser) return;

    if (scrapedData.length === 0) {
      alert('No events to save');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to save ${scrapedData.length} Open Day event(s) to the database?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const openDaysRef = collection(db, 'open_days');
      let savedCount = 0;

      for (const event of scrapedData) {
        if (!event.city || !event.date) {
          console.warn('Skipping event with missing data:', event);
          continue;
        }

        await addDoc(openDaysRef, {
          city: event.city,
          country: event.country,
          date: event.date,
          recruiter: event.recruiter || 'Emirates Group',
          description: event.description || `Open Day in ${event.city}`,
          created_by: currentUser.uid,
          created_at: Timestamp.now(),
          last_updated: Timestamp.now()
        });
        savedCount++;
      }

      alert(`Successfully saved ${savedCount} Open Day event(s)! Check the Open Days page to view them.`);
      setScrapedData([]);
      setUrl('https://www.emiratesgroupcareers.com/cabin-crew/');
      setError(null);
    } catch (error) {
      console.error('Error saving open days:', error);
      alert('Failed to save open days to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = () => {
    const newEvent: ScrapedOpenDay = {
      id: Date.now().toString(),
      city: '',
      country: '',
      date: '',
      recruiter: 'Emirates Group',
      description: '',
      editable: true
    };
    setScrapedData(prev => [...prev, newEvent]);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-2xl p-6"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Emirates Open Days Web Scraper</h1>
            <p className="text-white/90 mt-1">Extract and import Open Day events from Emirates website</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900">Note</h3>
            <p className="text-sm text-yellow-800 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Scrape Emirates Website</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Emirates Open Days URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://careers.emirates.com/cabin-crew/open-days"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:outline-none transition"
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter the URL of the Emirates Open Days page to extract event information
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScrape}
              disabled={loading || !url.trim()}
              className="flex-1 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scraping...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Scrape Data
                </>
              )}
            </button>
            <button
              onClick={handleAddManual}
              className="px-6 py-3 border-2 border-[#D71921] text-[#D71921] rounded-xl font-bold hover:bg-[#D71921] hover:text-white transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>
        </div>
      </div>

      {scrapedData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Scraped Events ({scrapedData.length})
            </h2>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save All to Database
            </button>
          </div>

          <div className="space-y-4">
            {scrapedData.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#D71921] transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          City
                        </label>
                        <input
                          type="text"
                          value={event.city}
                          onChange={(e) => handleEdit(event.id, 'city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D71921] focus:outline-none text-sm"
                          placeholder="e.g., Dubai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          <Globe className="w-3 h-3 inline mr-1" />
                          Country
                        </label>
                        <input
                          type="text"
                          value={event.country}
                          onChange={(e) => handleEdit(event.id, 'country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D71921] focus:outline-none text-sm"
                          placeholder="e.g., United Arab Emirates"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Date
                        </label>
                        <input
                          type="date"
                          value={event.date}
                          onChange={(e) => handleEdit(event.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D71921] focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Recruiter
                        </label>
                        <input
                          type="text"
                          value={event.recruiter}
                          onChange={(e) => handleEdit(event.id, 'recruiter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D71921] focus:outline-none text-sm"
                          placeholder="e.g., Emirates Airlines"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={event.description}
                        onChange={(e) => handleEdit(event.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D71921] focus:outline-none text-sm resize-none"
                        placeholder="Event description..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <h3 className="font-bold text-blue-900 mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Enter the Emirates Open Days URL above</li>
          <li>Click "Scrape Data" to extract events from the website</li>
          <li>Review and edit the extracted data as needed</li>
          <li>Click "Save All to Database" to import events into the Open Days section</li>
          <li>You can also add events manually using the "Add Manually" button</li>
        </ol>
        <p className="text-xs text-blue-700 mt-3">
          <strong>Note:</strong> This is a demo version. In production, web scraping would be handled by a backend service to avoid CORS issues.
        </p>
      </div>
    </div>
  );
}

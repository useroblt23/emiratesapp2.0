export interface ScrapedOpenDay {
  city: string;
  country: string;
  date: string;
  time?: string;
  venue?: string;
  recruiter: string;
  description: string;
}

export const scrapeEmiratesOpenDays = async (url: string): Promise<ScrapedOpenDay[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return getFallbackData();
    }

    const functionUrl = `${supabaseUrl}/functions/v1/scrape-emirates`;

    console.log('Calling scraper function with URL:', url);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Function response error:', errorText);
      return getFallbackData();
    }

    const result = await response.json();

    if (!result.success) {
      console.error('Scraping failed:', result.error);
      return getFallbackData();
    }

    if (result.fallback) {
      console.warn('Using fallback data:', result.message);
    }

    return result.data || getFallbackData();

  } catch (error) {
    console.error('Error calling scraper function:', error);
    return getFallbackData();
  }
};

const getFallbackData = (): ScrapedOpenDay[] => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const twoMonths = new Date(today);
  twoMonths.setMonth(today.getMonth() + 2);
  const threeMonths = new Date(today);
  threeMonths.setMonth(today.getMonth() + 3);

  return [
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      date: nextMonth.toISOString().split('T')[0],
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Open Day - Dubai World Trade Centre',
      venue: 'Dubai World Trade Centre',
      time: '09:00 AM'
    },
    {
      city: 'Abu Dhabi',
      country: 'United Arab Emirates',
      date: nextMonth.toISOString().split('T')[0],
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Assessment Day - Abu Dhabi Convention Centre',
      venue: 'Abu Dhabi Convention Centre',
      time: '10:00 AM'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      date: twoMonths.toISOString().split('T')[0],
      recruiter: 'Emirates Group',
      description: 'International Cabin Crew Open Day - London ExCeL',
      venue: 'ExCeL London',
      time: '09:30 AM'
    },
    {
      city: 'Mumbai',
      country: 'India',
      date: threeMonths.toISOString().split('T')[0],
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Open Day - Mumbai',
      venue: 'TBD',
      time: '10:00 AM'
    }
  ];
};

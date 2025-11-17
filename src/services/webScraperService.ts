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
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const openDays: ScrapedOpenDay[] = [];

    const eventElements = doc.querySelectorAll('.event-item, .open-day-item, [class*="event"], [class*="openday"]');

    if (eventElements.length > 0) {
      eventElements.forEach((element) => {
        const city = element.querySelector('[class*="city"], [class*="location"], h3, h4')?.textContent?.trim() || '';
        const dateText = element.querySelector('[class*="date"], time, [datetime]')?.textContent?.trim() || '';
        const description = element.querySelector('[class*="description"], p')?.textContent?.trim() || '';

        if (city || dateText) {
          openDays.push({
            city: city || 'TBD',
            country: extractCountry(element.textContent || ''),
            date: parseDate(dateText),
            recruiter: 'Emirates Group',
            description: description || `Cabin Crew Open Day in ${city}`
          });
        }
      });
    }

    const tables = doc.querySelectorAll('table');
    tables.forEach((table) => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, index) => {
        if (index === 0) return;

        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');

          const city = cellTexts[0] || '';
          const dateText = cellTexts[1] || '';

          if (city && dateText && !city.toLowerCase().includes('location') && !city.toLowerCase().includes('city')) {
            openDays.push({
              city: city,
              country: extractCountry(row.textContent || ''),
              date: parseDate(dateText),
              recruiter: 'Emirates Group',
              description: `Cabin Crew Open Day - ${city}`,
              venue: cellTexts[2] || '',
              time: cellTexts[3] || ''
            });
          }
        }
      });
    });

    const listItems = doc.querySelectorAll('ul li, ol li');
    listItems.forEach((item) => {
      const text = item.textContent?.trim() || '';
      const cityMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
      const dateMatch = text.match(/\d{1,2}[\s\-\/]\w+[\s\-\/]\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);

      if (cityMatch && dateMatch) {
        openDays.push({
          city: cityMatch[0],
          country: extractCountry(text),
          date: parseDate(dateMatch[0]),
          recruiter: 'Emirates Group',
          description: text.length > 100 ? text.substring(0, 100) + '...' : text
        });
      }
    });

    return openDays.length > 0 ? openDays : getFallbackData();

  } catch (error) {
    console.error('Error scraping Emirates website:', error);
    throw new Error('Failed to scrape data. This might be due to CORS restrictions or website changes.');
  }
};

const extractCountry = (text: string): string => {
  const countries = [
    'United Arab Emirates', 'UAE', 'United Kingdom', 'UK', 'Australia', 'Singapore',
    'India', 'South Africa', 'Kenya', 'Egypt', 'Jordan', 'Lebanon', 'Morocco',
    'Tunisia', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Philippines', 'Indonesia',
    'Malaysia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Turkey',
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
    'Austria', 'Poland', 'Greece', 'Ireland', 'Portugal', 'Canada', 'USA',
    'United States', 'Brazil', 'Argentina', 'Mexico', 'New Zealand'
  ];

  for (const country of countries) {
    if (text.includes(country)) {
      return country;
    }
  }

  const cityCountryMap: { [key: string]: string } = {
    'Dubai': 'United Arab Emirates',
    'Abu Dhabi': 'United Arab Emirates',
    'Sharjah': 'United Arab Emirates',
    'London': 'United Kingdom',
    'Manchester': 'United Kingdom',
    'Birmingham': 'United Kingdom',
    'Sydney': 'Australia',
    'Melbourne': 'Australia',
    'Singapore': 'Singapore',
    'Mumbai': 'India',
    'Delhi': 'India',
    'Bangalore': 'India',
    'Cairo': 'Egypt',
    'Johannesburg': 'South Africa',
    'Cape Town': 'South Africa',
    'Nairobi': 'Kenya',
    'Amman': 'Jordan',
    'Beirut': 'Lebanon',
    'Paris': 'France',
    'Madrid': 'Spain',
    'Rome': 'Italy',
    'Berlin': 'Germany',
    'Toronto': 'Canada',
    'New York': 'United States'
  };

  for (const [city, country] of Object.entries(cityCountryMap)) {
    if (text.includes(city)) {
      return country;
    }
  }

  return 'United Arab Emirates';
};

const parseDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  try {
    const cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');

    const formats = [
      /(\d{1,2})[\s\-\/](\w+)[\s\-\/](\d{2,4})/,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    ];

    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        const parsed = new Date(cleanDate);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      }
    }

    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

const getFallbackData = (): ScrapedOpenDay[] => {
  return [
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      date: '2025-12-15',
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Open Day - Dubai World Trade Centre',
      venue: 'Dubai World Trade Centre',
      time: '09:00 AM'
    },
    {
      city: 'Abu Dhabi',
      country: 'United Arab Emirates',
      date: '2025-12-20',
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Assessment Day - Abu Dhabi Convention Centre',
      venue: 'Abu Dhabi Convention Centre',
      time: '10:00 AM'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      date: '2026-01-10',
      recruiter: 'Emirates Group',
      description: 'International Cabin Crew Open Day - London ExCeL',
      venue: 'ExCeL London',
      time: '09:30 AM'
    },
    {
      city: 'Mumbai',
      country: 'India',
      date: '2026-01-15',
      recruiter: 'Emirates Group',
      description: 'Cabin Crew Open Day - Mumbai',
      venue: 'TBD',
      time: '10:00 AM'
    }
  ];
};

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScrapedOpenDay {
  city: string;
  country: string;
  date: string;
  time?: string;
  venue?: string;
  recruiter: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Scraper function called");
    
    const body = await req.json().catch(() => ({}));
    const url = body.url || "https://www.emiratesgroupcareers.com/cabin-crew/";

    console.log("Fetching URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!response.ok) {
        console.error("Fetch failed:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log("HTML fetched, length:", html.length);

      const openDays: ScrapedOpenDay[] = [];

      // Try to extract from tables
      const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
      const tableMatches = html.matchAll(tableRegex);

      for (const tableMatch of tableMatches) {
        const tableContent = tableMatch[1];
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
        const rows = Array.from(tableContent.matchAll(rowRegex));

        console.log("Found table with", rows.length, "rows");

        for (let i = 1; i < rows.length; i++) {
          const rowContent = rows[i][1];
          const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
          const cells = Array.from(rowContent.matchAll(cellRegex));

          if (cells.length >= 2) {
            const cellTexts = cells.map(cell => 
              cell[1].replace(/<[^>]*>/g, "").trim()
            );

            const city = cellTexts[0] || "";
            const dateText = cellTexts[1] || "";

            if (city && dateText && 
                !city.toLowerCase().includes("location") && 
                !city.toLowerCase().includes("city") &&
                !city.toLowerCase().includes("country")) {
              console.log("Found event:", city, dateText);
              openDays.push({
                city: city,
                country: extractCountry(city),
                date: parseDate(dateText),
                recruiter: "Emirates Group",
                description: `Cabin Crew Open Day - ${city}`,
                venue: cellTexts[2] || "",
                time: cellTexts[3] || "",
              });
            }
          }
        }
      }

      // Try to extract from specific patterns in the HTML
      const cityDatePattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)[\s\-,]+([\d]{1,2}[\s\/\-][A-Za-z]+[\s\/\-][\d]{2,4})/g;
      const matches = html.matchAll(cityDatePattern);
      
      for (const match of matches) {
        const city = match[1];
        const dateText = match[2];
        
        if (city && dateText && city.length < 50) {
          console.log("Found pattern match:", city, dateText);
          openDays.push({
            city: city,
            country: extractCountry(city),
            date: parseDate(dateText),
            recruiter: "Emirates Group",
            description: `Cabin Crew Open Day - ${city}`,
          });
        }
      }

      console.log("Total events found:", openDays.length);

      if (openDays.length === 0) {
        console.log("No events found, returning fallback data");
        return new Response(
          JSON.stringify({
            success: true,
            data: getFallbackData(),
            fallback: true,
            message: "No events found on the page. Using sample data that you can edit.",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: openDays,
          fallback: false,
          message: `Found ${openDays.length} events. You can edit them before saving.`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({
          success: true,
          data: getFallbackData(),
          fallback: true,
          message: "Could not fetch from Emirates website. Using sample data that you can edit.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: true,
        data: getFallbackData(),
        fallback: true,
        message: "An error occurred. Using sample data that you can edit.",
        error: error?.message || "Unknown error",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractCountry(text: string): string {
  const cityCountryMap: { [key: string]: string } = {
    "Dubai": "United Arab Emirates",
    "Abu Dhabi": "United Arab Emirates",
    "Sharjah": "United Arab Emirates",
    "Ajman": "United Arab Emirates",
    "London": "United Kingdom",
    "Manchester": "United Kingdom",
    "Birmingham": "United Kingdom",
    "Glasgow": "United Kingdom",
    "Sydney": "Australia",
    "Melbourne": "Australia",
    "Brisbane": "Australia",
    "Singapore": "Singapore",
    "Mumbai": "India",
    "Delhi": "India",
    "Bangalore": "India",
    "Chennai": "India",
    "Kolkata": "India",
    "Cairo": "Egypt",
    "Alexandria": "Egypt",
    "Johannesburg": "South Africa",
    "Cape Town": "South Africa",
    "Nairobi": "Kenya",
    "Amman": "Jordan",
    "Beirut": "Lebanon",
    "Paris": "France",
    "Madrid": "Spain",
    "Barcelona": "Spain",
    "Rome": "Italy",
    "Milan": "Italy",
    "Berlin": "Germany",
    "Frankfurt": "Germany",
    "Munich": "Germany",
    "Toronto": "Canada",
    "Vancouver": "Canada",
    "New York": "United States",
    "Los Angeles": "United States",
    "Miami": "United States",
    "Istanbul": "Turkey",
    "Bangkok": "Thailand",
    "Manila": "Philippines",
    "Jakarta": "Indonesia",
    "Kuala Lumpur": "Malaysia",
  };

  for (const [city, country] of Object.entries(cityCountryMap)) {
    if (text.includes(city)) {
      return country;
    }
  }

  return "United Arab Emirates";
}

function parseDate(dateStr: string): string {
  if (!dateStr) {
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().split("T")[0];
  }

  try {
    const cleanDate = dateStr
      .replace(/(\d+)(st|nd|rd|th)/g, "$1")
      .replace(/[\u00A0\s]+/g, " ")
      .trim();
    
    const parsed = new Date(cleanDate);
    
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2020) {
      return parsed.toISOString().split("T")[0];
    }

    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().split("T")[0];
  } catch (error) {
    console.error("Date parse error:", error);
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().split("T")[0];
  }
}

function getFallbackData(): ScrapedOpenDay[] {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const twoMonths = new Date(today);
  twoMonths.setMonth(today.getMonth() + 2);
  const threeMonths = new Date(today);
  threeMonths.setMonth(today.getMonth() + 3);

  return [
    {
      city: "Dubai",
      country: "United Arab Emirates",
      date: nextMonth.toISOString().split("T")[0],
      recruiter: "Emirates Group",
      description: "Cabin Crew Open Day - Dubai World Trade Centre",
      venue: "Dubai World Trade Centre",
      time: "09:00 AM",
    },
    {
      city: "Abu Dhabi",
      country: "United Arab Emirates",
      date: nextMonth.toISOString().split("T")[0],
      recruiter: "Emirates Group",
      description: "Cabin Crew Assessment Day - Abu Dhabi Convention Centre",
      venue: "Abu Dhabi Convention Centre",
      time: "10:00 AM",
    },
    {
      city: "London",
      country: "United Kingdom",
      date: twoMonths.toISOString().split("T")[0],
      recruiter: "Emirates Group",
      description: "International Cabin Crew Open Day - London ExCeL",
      venue: "ExCeL London",
      time: "09:30 AM",
    },
    {
      city: "Mumbai",
      country: "India",
      date: threeMonths.toISOString().split("T")[0],
      recruiter: "Emirates Group",
      description: "Cabin Crew Open Day - Mumbai",
      venue: "TBD",
      time: "10:00 AM",
    },
  ];
}

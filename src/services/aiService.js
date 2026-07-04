/**
 * CultureConnect GenAI Service
 * 
 * Provides integration with the Google Gemini API (gemini-1.5-flash) and 
 * implements prompt-engineering workflows enforcing JSON outputs.
 * 
 * Includes a rich mock fallback system that simulates LLM behaviors 
 * for rapid testing and out-of-the-box operations.
 */

// Helper to get Gemini API Key from environment or localStorage
export const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('CULTURE_CONNECT_GEMINI_KEY') || '';
};

// Helper to save Gemini API Key to localStorage
export const saveApiKey = (key) => {
  localStorage.setItem('CULTURE_CONNECT_GEMINI_KEY', key.trim());
};

/**
 * System Prompts
 */
const SYSTEM_PROMPTS = {
  antiTourist: `You are an elite, cynical yet passionate local cultural guide.
Your goal is to steer travelers AWAY from overhyped, overcrowded tourist traps and TOWARDS authentic, local-first spots and artisan shops.
Given a city name, analyze the location and return:
1. Exactly 3 famous "tourist traps" that are overrated, commercialized, or overpriced, with detailed, witty justifications on why to skip or limit time there.
2. Exactly 4-5 verified, highly authentic "hidden gems" or local artisan spots, each with their name, type, a vivid description of their authenticity, rough location/neighborhood, and the exact cultural vibe.

You MUST respond strictly in the following JSON format without any markdown wrapper:
{
  "city": "Name of the City",
  "touristTraps": [
    {
      "name": "Name of the tourist trap",
      "reason": "Clear explanation of why it is a trap, what to watch out for, or when it might actually be worth it (if ever)."
    }
  ],
  "hiddenGems": [
    {
      "name": "Name of the hidden gem or artisan spot",
      "type": "E.g., Artisan Craft Workshop, Historic Alleyway, Family-run Osteria, Panoramic Viewpoint, Community Tea House",
      "description": "Rich description explaining why locals love it, its cultural history, and what makes it authentic.",
      "location": "Vague neighborhood or specific directions suitable for travelers",
      "vibe": "E.g., Nostalgic, Lively, Serene, Craftsman-focused, Fragrant"
    }
  ]
}`,

  storyteller: `You are an immersive cultural historian and sensory storyteller.
Your task is to generate a multi-sensory heritage narrative for a selected location or cultural landmark.
The narrative must feel highly evocative, almost like audio guide scripts, drawing the user into the environment.
Given a location, return a JSON response containing:
1. An evocative, poetic title for the narrative.
2. A sensory breakdown of what the traveler would see (visuals), hear (auditory landscape), and smell/taste (olfactory landscape) at this location.
3. Immersive narrative sections covering:
   - Historical Context (the deep origins)
   - Cultural Significance (what it represents to the community today)
   - Local Legend (a specific myth, folklore, or local tale associated with it)
4. A valuable "Insider Tip" (a secret detail, interaction, or specific timing to experience the site).

You MUST respond strictly in the following JSON format without any markdown wrapper:
{
  "location": "Specific location or landmark",
  "title": "Evocative, poetic title",
  "sensoryDetails": {
    "sights": "Vivid visual description of light, textures, and structures",
    "sounds": "The auditory backdrop - dialects, rustling, specific hums, local music",
    "smells": "The smells or tastes in the air - street food, sea air, cedar wood, incenses"
  },
  "narrative": {
    "historicalContext": "Engaging historical origin script.",
    "culturalSignificance": "Explanation of rituals, community significance, or local connections.",
    "localLegend": "The myth, ghost story, or legend that locals share about this place."
  },
  "insiderTip": "A secret local tip for experiencing this spot at its best."
}`,

  events: `You are a local cultural calendar synthesizer.
Your task is to cross-reference travel dates with local cultural calendars to simulate authentic local happenings, pop-up markets, neighborhood festivals, and masterclasses.
Given a destination and a date range, generate a response containing:
1. The destination name and confirmed travel dates.
2. A list of 3-4 highly specific, culturally authentic events that would occur during this period (e.g. seasonal harvests, neighborhood block parties, temple markets, independent art pop-ups).

You MUST respond strictly in the following JSON format without any markdown wrapper:
{
  "destination": "Destination name",
  "dateRange": "User's date description",
  "events": [
    {
      "id": "unique-id",
      "title": "Name of the authentic event or workshop",
      "type": "Festival, Pop-up Market, Performance, Masterclass, Community Gathering",
      "date": "Specific simulated date during the date range",
      "description": "Engaging description of what happens, who attends, and why it is unique.",
      "culturalRoot": "The historical tradition, seasonal change, or social custom this event stems from.",
      "vibe": "One or two words capturing the mood (e.g. Electric, Joyful, Meditative, Communal)"
    }
  ]
}`
};

/**
 * Curated Mock Data for Fallback/Offline Mode
 * Includes: Tokyo, Paris, Rome, Kyoto, Cairo
 */
const MOCK_DATA = {
  antiTourist: {
    "tokyo": {
      "city": "Tokyo",
      "touristTraps": [
        {
          "name": "Takeshita Street (Harajuku)",
          "reason": "Extremely crowded to the point of immobility, filled with overpriced rainbow food stalls and commercial chain stores rather than the authentic independent fashion subcultures of the 90s."
        },
        {
          "name": "Shibuya Crossing Starbuck's Window",
          "reason": "You will wait in a long queue for a mediocre coffee just to get a window seat. Instead, view the crossing from the Mag's Park rooftop terrace or Shibuya Sky for far superior angles."
        },
        {
          "name": "Robot Restaurant / Over-commercialized Show Cafés",
          "reason": "Highly expensive, manufactured spectacles designed solely for tourists with zero connection to real Japanese pop culture or theatrical tradition."
        }
      ],
      "hiddenGems": [
        {
          "name": "Yanaka Ginza",
          "type": "Nostalgic Shopping Street (Shitamachi)",
          "description": "One of the few areas that survived wartime bombings. Yanaka retains the 'Shitamachi' (old downtown) feel. It is quiet, cat-themed, and filled with local street foods, traditional paper shops, and family-run senbei (rice cracker) stalls.",
          "location": "Taito Ward (near Nippori Station)",
          "vibe": "Nostalgic, peaceful, and warm"
        },
        {
          "name": "Kosoan Tea House",
          "type": "Traditional Tea Salon",
          "description": "An oasis hidden inside a residential pocket of Jiyugaoka. This 100-year-old traditional wooden home has been converted into a tearoom overlooking a meticulously landscaped Japanese garden. Enjoy matcha and wagashi on tatami mats.",
          "location": "Meguro Ward (Jiyugaoka)",
          "vibe": "Serene, meditative, and authentic"
        },
        {
          "name": "Omoide Yokocho (Alternative: Nonbei Yokocho)",
          "type": "Historic Alleyway Eateries",
          "description": "While Omoide has tourist interest, Nonbei Yokocho (Drunkard's Alley) or local alleys in Koenji offer small, 4-seat bars where local salarymen swap stories over charcoal-grilled yakitori. It is intimate and represents true post-war drinking culture.",
          "location": "Shibuya / Koenji",
          "vibe": "Intimate, smoky, and spirited"
        },
        {
          "name": "Sudo-jutaku Crafts",
          "type": "Artisan Paper & Dye Workshop",
          "description": "A family workshop where traditional Washi paper is handmade using techniques from the Edo period. Visitors can observe the dye process and purchase authentic stationary directly from the artisans.",
          "location": "Bunkyo Ward",
          "vibe": "Craftsman-focused and dedicated"
        }
      ]
    },
    "paris": {
      "city": "Paris",
      "touristTraps": [
        {
          "name": "Champs-Élysées & Ladurée",
          "reason": "A multi-lane highway packed with international chain stores, exhaust fumes, and massive pickpocket risks. The Ladurée macarons can be purchased at the airport without the 45-minute queue."
        },
        {
          "name": "Climbing the Eiffel Tower",
          "reason": "Long queues, expensive security checks, and once you are on it, you cannot see the Eiffel Tower itself in the skyline! Go to Tour Montparnasse or Belleville Park for a better view."
        },
        {
          "name": "Mona Lisa Room (Louvre)",
          "reason": "You will be ushered into a massive room with hundreds of cell phones blocking your view of a tiny, heavily guarded painting. Wander the Louvre's Near Eastern Antiquities or Richelieu wing instead."
        }
      ],
      "hiddenGems": [
        {
          "name": "Promenade Plantée (Coulée Verte René-Dumont)",
          "type": "Elevated Linear Parkway",
          "description": "The world's first elevated parkway, built on a defunct 19th-century railway line. You walk 10 meters above the streets, lined with wild rosebushes, cherry trees, and views of residential Parisian facades.",
          "location": "12th Arrondissement",
          "vibe": "Romantic, leafy, and breezy"
        },
        {
          "name": "Marché aux Puces de Saint-Ouen (Paul Bert Serpette section)",
          "type": "Art & Antique Market",
          "description": "The largest flea market in the world, but specifically the Paul Bert Serpette area. It is a labyrinth of stalls where high-end dealers showcase mid-century furniture, vintage couture, and bizarre curiosities. A museum where everything is for sale.",
          "location": "Porte de Clignancourt",
          "vibe": "Eclectic, historic, and sophisticated"
        },
        {
          "name": "Du Pain et des Idées",
          "type": "Traditional Boulangerie Artisanale",
          "description": "An authentic wood-fired bakery from 1889. Known for the 'L'Escargot Chocolat Pistache' (pistachio chocolate snail pastry) and 'Pain des Amis'. The bakers still use traditional slow fermentation processes.",
          "location": "10th Arrondissement (Canal Saint-Martin)",
          "vibe": "Fragrant, rustic, and bustling"
        },
        {
          "name": "Musée de la Vie Romantique",
          "type": "Museum & Secret Garden Cafe",
          "description": "A green-shuttered villa at the foot of Montmartre. Once the home of painter Ary Scheffer, it hosted Chopin and George Sand. The cobblestone courtyard features a greenhouse tea garden run by local pastry makers.",
          "location": "9th Arrondissement",
          "vibe": "Serene, literary, and vintage"
        }
      ]
    },
    "rome": {
      "city": "Rome",
      "touristTraps": [
        {
          "name": "Trevi Fountain at Midday",
          "reason": "Elbow-to-elbow crowds, heavy police surveillance to prevent sitting, and a wall of selfie sticks that destroys the romanticism. Visit at 3:00 AM or walk to the nearby Aqua Virgo aqueduct exhibition instead."
        },
        {
          "name": "Vatican Museum Guided Group Tours",
          "reason": "Rushed cattle-calls through miles of galleries where you are pushed along by guards. Rent an audio guide and go during Friday evening night-openings for a serene experience."
        },
        {
          "name": "Restaurants with Picture Menus around Piazza Navona",
          "reason": "Overpriced, microwaved food, and 'pane e coperto' (bread and service charge) markups targeting tourists. Real Roman food is found in residential alleys."
        }
      ],
      "hiddenGems": [
        {
          "name": "Trastevere Alleys (South of Viale di Trastevere)",
          "type": "Bohemian Neighborhood & Artisan Stores",
          "description": "While Northern Trastevere is touristy, the Southern side is a quiet labyrinth of ivy-covered brick arches, active blacksmiths, leather workshops, and small trattorias serving authentic Cacio e Pepe.",
          "location": "Trastevere Rione",
          "vibe": "Lively, rustic, and historical"
        },
        {
          "name": "Centrale Montemartini",
          "type": "Archaeological Museum in a Power Plant",
          "description": "A stunning visual contrast where classical Roman marble sculptures of gods and emperors are exhibited against a backdrop of massive, preserved early 20th-century diesel engines and boilers.",
          "location": "Ostiense District",
          "vibe": "Industrial, classical, and surreal"
        },
        {
          "name": "Antico Forno Roscioli",
          "type": "Historic Bakery & Pizza al Taglio",
          "description": "Operating for generations, this bakery produces Rome's best Pizza Bianca (simple olive oil and salt flatbread) and Roman-style thin pizza. Try the pizza rossa with simple, rich tomato sauce.",
          "location": "Near Campo de' Fiori",
          "vibe": "Aromatic, chaotic, and mouthwatering"
        },
        {
          "name": "The Aventine Keyhole",
          "type": "Architectural Viewpoint",
          "description": "Peer through the keyhole of the Priory of the Knights of Malta. It aligns perfectly with a garden path of manicured cypress trees, framing a miniature view of the dome of St. Peter's Basilica.",
          "location": "Aventine Hill",
          "vibe": "Mysterious, photographic, and quiet"
        }
      ]
    }
  },

  storyteller: {
    "yanaka ginza": {
      "location": "Yanaka Ginza, Tokyo",
      "title": "Whispers of Old Edo in the Shadow of Cats",
      "sensoryDetails": {
        "sights": "Warm orange sunset glowing over wooden facades, wooden carvings of cats perched on roofs, elderly merchants bending over stalls of roasted chestnuts.",
        "sounds": "The metallic ring of a bicycle bell, the soft rhythmic clacking of wooden sandals (geta), and the friendly banter of stallholders calling out 'irasshaimase!'",
        "smells": "The rich, sweet scent of roasted sweet potatoes (yaki-imo), grilled soy sauce glaze on skewered dango, and damp earth from potted bonsai lining the lanes."
      },
      "narrative": {
        "historicalContext": "Yanaka is part of Tokyo's Shitamachi, the historic lower-class districts where craftsmen and merchants lived during the Edo period (1603-1867). Miraculously spared by both the 1923 Great Kanto Earthquake and the air raids of WWII, its temples and residential alleys preserve the architectural scales of an older Tokyo, long consumed by skyscrapers elsewhere.",
        "culturalSignificance": "To Tokyoites, Yanaka represents 'Showa Nostalgia'—a feeling of community, slow living, and human warmth. It is a living neighborhood where locals buy their daily groceries and clean family graves at the historic Yanaka Cemetery, keeping the spirit of ancestral connection alive in the middle of a high-tech metropolis.",
        "localLegend": "The streets are famously guarded by stray cats, which locals refer to as 'kami' (spirits) of the neighborhood. The legend goes that a 19th-century monk at a local temple had a cat that warned him of a major fire by scratching at his robes. Today, seven carved wooden cat statues are placed along Yanaka Ginza's roofs, and finding all seven is said to bring a traveler safe passage back home."
      },
      "insiderTip": "Walk to the top of the 'Yuyake Dandan' (Sunset Staircase) at around 5:15 PM. Watch the sun dip below the low-slung rooftops, turning the street into a golden corridor. Grab a hot minced meat cutlet (menchi-katsu) from Niku no Suzuki at the bottom of the stairs to eat like a true local."
    },
    "promenade plantee": {
      "location": "Promenade Plantée, Paris",
      "title": "A Walk Above the Paris Roofs",
      "sensoryDetails": {
        "sights": "Lime-green canopies of lime trees, arches of wild climbing roses, historic brick railway viaducts, and glimpses of private Parisian balconies with laundry flapping in the breeze.",
        "sounds": "The muffled hum of city traffic far below, the singing of blackbirds nesting in the ivy, and the soft crunch of gravel under running shoes.",
        "smells": "Damp moss, blooming lavender, freshly cut grass, and the faint buttery aroma of baking croissants rising from neighborhood ovens below."
      },
      "narrative": {
        "historicalContext": "This pathway sits on the former Vincennes railway line, which connected Paris to its eastern suburbs from 1859. Abandoned in 1969, the railway line was reclaimed by nature. In the 1980s, landscape architects Jacques Vergely and Philippe Mathieux reimagined it as a linear garden park, opening it in 1993 as the world's first elevated walkway, inspiring New York's High Line.",
        "culturalSignificance": "The Promenade represents the Parisian concept of 'flânerie'—the art of aimless, sensory wandering. It is a public space where neighborhood residents jog, couples meet, and writers sit on benches, creating a sanctuary of quiet reflection that rises literally above the stress of city transit.",
        "localLegend": "Urban explorers speak of the 'Ghost of the Viaduct'—a former railway operator who refused to leave his station when the line closed. Locals say he planted the first wild rose seeds along the tracks to ensure the line wouldn't be replaced by concrete buildings, laying the emotional groundwork for the public park that exists today.",
      },
      "insiderTip": "Start your walk from the Bastille end, above the Viaduc des Arts. Underneath the arches of the path are workshops of master glassblowers, furniture restorers, and tapestry weavers. Peek through the glass windows at the bottom of the brick walls to see traditional French craftsmanship in action."
    }
  },

  events: {
    "tokyo": {
      "destination": "Tokyo, Japan",
      "dateRange": "Spring Season",
      "events": [
        {
          "id": "e-tokyo-1",
          "title": "Sanya Sanja Matsuri (Asakusa)",
          "type": "Festival",
          "date": "Mid-May",
          "description": "One of Tokyo's wildest and loudest festivals, celebrating the three founders of Senso-ji temple. Teams of locals carry massive, golden portable shrines (mikoshi) through the streets, chanting and bouncing the shrines to wake the spirits.",
          "culturalRoot": "Shinto harvest celebrations and community solidarity, originating in the 14th century to secure neighborhood good fortune.",
          "vibe": "Electric"
        },
        {
          "id": "e-tokyo-2",
          "title": "Yanaka Craft & Antique Temple Market",
          "type": "Pop-up Market",
          "date": "Every Second Sunday",
          "description": "A quiet, community-run market held in the courtyard of Tenmyo-in Temple. Local woodworkers, second-hand kimono collectors, and organic tea farmers lay out rugs to sell their wares directly to neighborhood families.",
          "culturalRoot": "The temple market tradition (Ennichi), where communities gather on holy days to support local artisans.",
          "vibe": "Communal"
        },
        {
          "id": "e-tokyo-3",
          "title": "Washi Papermaking & Indigo Dyeing Workshop",
          "type": "Masterclass",
          "date": "Flexible Bookings",
          "description": "An intimate, hands-on workshop led by a 4th-generation indigo master. Learn the chemical process of natural fermentation of indigo leaves and dye your own organic hemp scarf.",
          "culturalRoot": "Aizome (Japanese Indigo Dyeing), historically known as 'Japan Blue' due to its prevalence in Edo-period clothing.",
          "vibe": "Meditative"
        }
      ]
    },
    "paris": {
      "destination": "Paris, France",
      "dateRange": "Summer / Autumn",
      "events": [
        {
          "id": "e-paris-1",
          "title": "Fête de la Musique",
          "type": "Performance",
          "date": "June 21st",
          "description": "A city-wide musical celebration where all streets, parks, and courtyards are filled with free live performances. From amateur jazz bands on street corners to classical choirs in medieval chapels, the city is a live stage.",
          "culturalRoot": "A national initiative started in 1982 to democratize music making and celebrate the summer solstice.",
          "vibe": "Joyful"
        },
        {
          "id": "e-paris-2",
          "title": "Brocante de la Rue de Bretagne",
          "type": "Pop-up Market",
          "date": "Late Spring & Autumn",
          "description": "A massive, authentic neighborhood street market in the Marais district. Hundreds of Parisian residents set up tables alongside professional antique dealers, selling old books, prints, porcelain, and vintage goods.",
          "culturalRoot": "The French love of 'vide-greniers' (attic emptying) and historical objects preservation.",
          "vibe": "Bustling"
        },
        {
          "id": "e-paris-3",
          "title": "Artisanal Cheese & Natural Wine Masterclass",
          "type": "Masterclass",
          "date": "Every Thursday Night",
          "description": "Join local affineur (cheese aging specialist) in a damp 17th-century cellar in Belleville. Learn how raw-milk cheeses reflect their distinct 'terroirs' paired with low-intervention organic wines.",
          "culturalRoot": "The deep agrarian roots of French cheese production and the natural winemaking revival.",
          "vibe": "Sophisticated"
        }
      ]
    }
  }
};

/**
 * Dynamically generates a fallback object if the city is not explicitly mocked.
 * Ensures the app works for ANY search query.
 */
const generateDynamicMock = (type, query, extra = '') => {
  const queryClean = query.trim().split(',')[0];
  const queryCap = queryClean.charAt(0).toUpperCase() + queryClean.slice(1).toLowerCase();
  
  if (type === 'antiTourist') {
    return {
      "city": queryCap,
      "touristTraps": [
        {
          "name": `The Main Commercial Boulevard in ${queryCap}`,
          "reason": "Saturated with global fast-food joints and identical souvenirs. The prices are double compared to the streets just two blocks parallel."
        },
        {
          "name": `The Landmark Observation Tower of ${queryCap}`,
          "reason": "Features a 2-hour ticket queue and tinted security glass. For better scenery, find a rooftop restaurant or local hill to watch the sunset."
        },
        {
          "name": `The Hop-on Hop-off Double Decker Tour Bus`,
          "reason": "Extremely slow, costly, and disconnects you from the actual neighborhoods. The local subway or walking alleys are much more immersive."
        }
      ],
      "hiddenGems": [
        {
          "name": `The Old Artisan Quarter of ${queryCap}`,
          "type": "Historic Crafts District",
          "description": `A network of brick paths where family workshops fabricate traditional wares. Watch the craftsmen operate ancient machinery and buy goods directly from the makers.`,
          "location": "Historic District (East Side)",
          "vibe": "Craftsman-focused"
        },
        {
          "name": "The Riverside Willow Walkway",
          "type": "Scenic Path & Tea/Coffee Garden",
          "description": "A stone-paved path along the canal where locals gather at dusk. Small tea huts serve local drinks and offer a serene look at the district.",
          "location": "Canal-front Alley",
          "vibe": "Serene"
        },
        {
          "name": "Local Family Bistro (Mamma's Kitchen)",
          "type": "Family-run Eatery",
          "description": "No menu in English, and only four tables. Serves traditional cuisine made from scratch by the grandparents of the family using local ingredients.",
          "location": "Residential Suburb Alleys",
          "vibe": "Nostalgic"
        }
      ]
    };
  }

  if (type === 'storyteller') {
    return {
      "location": queryCap,
      "title": `Echoes of Ancestors: The Soul of ${queryCap}`,
      "sensoryDetails": {
        "sights": "Chipped stone facades, golden lantern light throwing long shadows, moss growing in the masonry cracks.",
        "sounds": "The distant ring of church/temple bells, laughter echoing from kitchen doors, and the scuffle of neighborhood cats.",
        "smells": "Baking bread, woodsmoke, roasted spices, and old paper dust."
      },
      "narrative": {
        "historicalContext": `The foundations of ${queryCap} date back centuries, built by traders and stone masons. It survived wars and industrialization, retaining its human-scale layout and old-world masonry structures.`,
        "culturalSignificance": `For locals, this area represents their community hub—a place where elders gather on benches to play chess and children run along cobblestones, bridging generations through memory.`,
        "localLegend": `Locals speak of a guardian spirit that walks the cobblestones when fog rolls in. Finding a small bronze coin on the curb is said to be the spirit's blessing for safe travel.`
      },
      "insiderTip": "Find the small stone archway at the corner of the square. At 6:00 PM, the light filters through at an angle that illuminates the carved cornerstone. Sit on the wooden bench nearby and simply listen."
    };
  }

  if (type === 'events') {
    const dates = extra || 'Your travel dates';
    return {
      "destination": queryCap,
      "dateRange": dates,
      "events": [
        {
          "id": `e-dyn-1`,
          "title": `${queryCap} Neighborhood Block Market`,
          "type": "Pop-up Market",
          "date": `Active during ${dates}`,
          "description": "Local food vendors, craft brewers, and acoustic musicians occupy the central lane for an evening of food and community chat.",
          "culturalRoot": "Neighborhood mutual-aid and local business support gathering.",
          "vibe": "Communal"
        },
        {
          "id": `e-dyn-2`,
          "title": `Traditional Workshop and Storytelling Circle`,
          "type": "Masterclass",
          "date": "Every Saturday Afternoon",
          "description": "A master craftsman demonstrates ancient building/carving techniques, followed by local oral history storytelling over tea.",
          "culturalRoot": "Oral history preservation and passing down craftsmanship skills.",
          "vibe": "Meditative"
        }
      ]
    };
  }
};

/**
 * Calls the Google Gemini API using fetch.
 * Enforces JSON mode via system prompts and generationConfig.
 * Falls back to mock data if the API call fails or if no API key is set.
 */
const callGeminiApi = async (systemPrompt, userPrompt, apiKey) => {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Combine system instructions and user request into the prompt body
    const promptText = `${systemPrompt}\n\nUser Request: ${userPrompt}\n\nProvide the response strictly as a JSON string matching the specified schema. Ensure all fields are filled. Do not wrap in markdown \`\`\`json blocks.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2, // Low temperature for consistent JSON layouts
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Empty response from Gemini API candidates.");
    }

    // Parse and return the JSON
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.warn("Gemini API call failed, falling back to mock data.", error);
    throw error; // Re-throw to let the caller handle fallback or show warning
  }
};

/**
 * Service API: The "Anti-Tourist" Engine
 * City Name -> Tourist traps and local hidden gems
 */
export const getAntiTouristData = async (cityName) => {
  if (!cityName || !cityName.trim()) {
    throw new Error("Location parameter cannot be empty");
  }
  const normalizedCity = cityName.trim().toLowerCase();
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      return await callGeminiApi(
        SYSTEM_PROMPTS.antiTourist, 
        `Generate the Anti-Tourist analysis for the city of: ${cityName}`, 
        apiKey
      );
    } catch (error) {
      console.warn("Gemini API call failed, falling back to mock data.", error);
      if (import.meta.env.MODE === 'test') {
        throw error;
      }
    }
  }

  // Mock Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_DATA.antiTourist[normalizedCity]) {
        resolve(MOCK_DATA.antiTourist[normalizedCity]);
      } else {
        resolve(generateDynamicMock('antiTourist', cityName));
      }
    }, 800); // Small delay to simulate network/AI generation
  });
};

/**
 * Service API: Immersive Heritage Storyteller
 * Location Name -> Multi-sensory narrative script
 */
export const getHeritageNarrative = async (locationName) => {
  if (!locationName || !locationName.trim()) {
    throw new Error("Location parameter cannot be empty");
  }
  const normalizedLoc = locationName.trim().toLowerCase();
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      return await callGeminiApi(
        SYSTEM_PROMPTS.storyteller, 
        `Generate an immersive heritage narrative for: ${locationName}`, 
        apiKey
      );
    } catch (error) {
      console.warn("Gemini API call failed, falling back to mock data.", error);
      if (import.meta.env.MODE === 'test') {
        throw error;
      }
    }
  }

  // Mock Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_DATA.storyteller[normalizedLoc]) {
        resolve(MOCK_DATA.storyteller[normalizedLoc]);
      } else {
        resolve(generateDynamicMock('storyteller', locationName));
      }
    }, 800);
  });
};

/**
 * Service API: Dynamic Event Surface
 * Destination + Travel Dates -> Simulated cultural happenings
 */
export const getDynamicEvents = async (destinationName, dateRange) => {
  if (!destinationName || !destinationName.trim()) {
    throw new Error("Location parameter cannot be empty");
  }
  const normalizedDest = destinationName.trim().toLowerCase();
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      return await callGeminiApi(
        SYSTEM_PROMPTS.events, 
        `Synthesize a cultural event calendar for destination: ${destinationName} during dates: ${dateRange}`, 
        apiKey
      );
    } catch (error) {
      console.warn("Gemini API call failed, falling back to mock data.", error);
      if (import.meta.env.MODE === 'test') {
        throw error;
      }
    }
  }

  // Mock Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_DATA.events[normalizedDest]) {
        resolve(MOCK_DATA.events[normalizedDest]);
      } else {
        resolve(generateDynamicMock('events', destinationName, dateRange));
      }
    }, 800);
  });
};

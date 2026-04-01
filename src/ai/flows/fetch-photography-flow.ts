'use server';
/**
 * @fileOverview A flow to fetch photography data for the @ash.galleryyy profile.
 * 
 * - fetchPhotography - Main function to retrieve photography items.
 * - PhotographyItem - Schema for individual photography posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PhotographyItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  imageSeed: z.string(),
  timestamp: z.string(),
  caption: z.string().optional(),
});

export type PhotographyItem = z.infer<typeof PhotographyItemSchema>;

const FetchPhotographyOutputSchema = z.array(PhotographyItemSchema);
export type FetchPhotographyOutput = z.infer<typeof FetchPhotographyOutputSchema>;

/**
 * Fetches photography data. 
 * Note: In a production environment, this would call the Instagram Basic Display API
 * using a Long-Lived Access Token.
 */
export async function fetchPhotography(): Promise<FetchPhotographyOutput> {
  return fetchPhotographyFlow();
}

const fetchPhotographyFlow = ai.defineFlow(
  {
    name: 'fetchPhotographyFlow',
    inputSchema: z.void(),
    outputSchema: FetchPhotographyOutputSchema,
  },
  async () => {
    // This simulates an API call to Instagram for @ash.galleryyy
    // To connect to real Instagram API, you would fetch from:
    // `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp&access_token=${TOKEN}`
    
    const mockData: FetchPhotographyOutput = [
      {
        id: "ig_1",
        title: "Golden Hour Glow",
        location: "La Jolla Cove",
        imageSeed: "ash-gallery-1",
        timestamp: "2024-03-20",
        caption: "Chasing light at the edge of the world."
      },
      {
        id: "ig_2",
        title: "Urban Geometry",
        location: "Downtown San Diego",
        imageSeed: "ash-gallery-2",
        timestamp: "2024-03-18",
        caption: "Lines that define our city."
      },
      {
        id: "ig_3",
        title: "Pacific Silence",
        location: "Sunset Cliffs",
        imageSeed: "ash-gallery-3",
        timestamp: "2024-03-15",
        caption: "Where the sky meets the sea."
      },
      {
        id: "ig_4",
        title: "The Geisel Perspective",
        location: "UC San Diego",
        imageSeed: "ash-gallery-4",
        timestamp: "2024-03-12",
        caption: "Architectural mastery at UCSD."
      },
      {
        id: "ig_5",
        title: "Nocturnal Pulse",
        location: "Gaslamp Quarter",
        imageSeed: "ash-gallery-5",
        timestamp: "2024-03-10",
        caption: "The city never truly sleeps."
      },
      {
        id: "ig_6",
        title: "Ethereal Morning",
        location: "Torrey Pines",
        imageSeed: "ash-gallery-6",
        timestamp: "2024-03-05",
        caption: "Fog rolling over the canyons."
      },
      {
        id: "ig_7",
        title: "Industrial Rhythm",
        location: "North Island",
        imageSeed: "ash-gallery-7",
        timestamp: "2024-03-01",
        caption: "Structure and strength."
      },
      {
        id: "ig_8",
        title: "Candid Humanity",
        location: "Little Italy",
        imageSeed: "ash-gallery-8",
        timestamp: "2024-02-28",
        caption: "Moments caught in between."
      },
      {
        id: "ig_9",
        title: "Vibrant Decay",
        location: "Old Town",
        imageSeed: "ash-gallery-9",
        timestamp: "2024-02-25",
        caption: "History in every texture."
      }
    ];

    return mockData;
  }
);

import type { ArtworkTable } from "../data/Artwork";

const API_URL = "https://api.artic.edu/api/v1/artworks";
export const TableData = 
    {
        async getArtworks(page: number): Promise<ArtworkTable> {
          const response = await fetch(`${API_URL}?page=${page}`);
          if (!response.ok) {
            throw new Error("Failed to fetch artworks");
          }
          return response.json();
        }
    }




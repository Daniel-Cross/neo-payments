import axios from "axios";

export interface PriceData {
  solPrice: number;
  lastUpdated: number;
}

class PriceService {
  private static instance: PriceService;
  private cache: PriceData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {}

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  /**
   * Fetch current SOL price from CoinGecko API
   * Uses caching to avoid excessive API calls
   */
  public async getSolPrice(currency: string = "usd"): Promise<number> {
    const now = Date.now();

    // Return cached price if it's still valid
    if (this.cache && now - this.cache.lastUpdated < this.CACHE_DURATION) {
      return this.cache.solPrice;
    }

    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: "solana",
            vs_currencies: currency.toLowerCase(),
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const solPrice = response.data.solana?.[currency.toLowerCase()];

      if (typeof solPrice === "number" && solPrice > 0) {
        // Cache the result
        this.cache = {
          solPrice,
          lastUpdated: now,
        };

        return solPrice;
      } else {
        throw new Error("Invalid price data received");
      }
    } catch (error) {
      console.error("Failed to fetch SOL price:", error);

      // Return cached price if available, otherwise default
      if (this.cache) {
        console.log("Using cached SOL price due to API error");
        return this.cache.solPrice;
      }

      // Default fallback price
      return 100;
    }
  }

  /**
   * Get cached price without making API call
   */
  public getCachedSolPrice(): number | null {
    return this.cache?.solPrice || null;
  }

  /**
   * Clear the price cache
   */
  public clearCache(): void {
    this.cache = null;
  }

  /**
   * Check if cache is valid
   */
  public isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    return now - this.cache.lastUpdated < this.CACHE_DURATION;
  }
}

// Export singleton instance
export const priceService = PriceService.getInstance();

// Export default for convenience
export default priceService;

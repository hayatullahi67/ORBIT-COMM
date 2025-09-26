import { useState, useEffect } from 'react';
import { getPrices } from '@/lib/tiger-sms-api';

// Define the structure of the pricing data
export interface ServicePrice {
  cost: number;
  count: number;
}

export interface CountryPrices {
  [serviceCode: string]: ServicePrice;
}

export interface AllPrices {
  [countryCode: string]: CountryPrices;
}

const API_KEY = 'BJ93bFKepOfAjB5cELEDaKfDJyE5p9C1';

export const useTigerSmsPrices = () => {
  const [prices, setPrices] = useState<AllPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const responseText = await getPrices(API_KEY);
        const rawData = JSON.parse(responseText);

        // The API might return numbers as strings, so we parse them.
        const parsedData: AllPrices = {};
        for (const countryCode in rawData) {
          if (Object.prototype.hasOwnProperty.call(rawData, countryCode)) {
            const countryServices = rawData[countryCode];
            parsedData[countryCode] = {};
            for (const serviceCode in countryServices) {
              if (Object.prototype.hasOwnProperty.call(countryServices, serviceCode)) {
                const serviceDetails = countryServices[serviceCode];
                parsedData[countryCode][serviceCode] = { cost: parseFloat(serviceDetails.cost), count: parseInt(serviceDetails.count, 10) };
              }
            }
          }
        }
        setPrices(parsedData);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch pricing data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []); // Empty dependency array ensures this runs only once on mount

  return { prices, loading, error };
};
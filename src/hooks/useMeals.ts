import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Meal } from '../utils/mealLogic';

const CACHE_KEY = 'meal_plan_cache';
const CACHE_TIMESTAMP_KEY = 'meal_plan_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface UseMealsReturn {
  meals: Meal[] | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

export function useMeals(githubUrl: string): UseMealsReturn {
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);

      // Fetch from GitHub
      const response = await axios.get(githubUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      // Parse Excel
      const workbook = XLSX.read(response.data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Meal>(worksheet);

      setMeals(data);

      // Cache the data
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch meal plan';
      setError(errorMsg);

      // Try to load from cache
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setMeals(parsed);
          setIsOffline(true);
          setError(null);
        }
      } catch (cacheErr) {
        // Cache is also unavailable
        setMeals(null);
      }
    } finally {
      setLoading(false);
    }
  }, [githubUrl]);

  // Initial load from cache or network
  useEffect(() => {
    const initialize = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

        const cacheExpired =
          !timestamp || Date.now() - parseInt(timestamp) > CACHE_DURATION;

        if (cachedData && !cacheExpired) {
          // Use cache if valid
          setMeals(JSON.parse(cachedData));
          setLoading(false);
        }
      } catch (err) {
        console.log('Cache read error:', err);
      }

      // Always try to fetch fresh data
      await fetchMeals();
    };

    initialize();
  }, [fetchMeals]);

  return { meals, loading, error, isOffline, refresh: fetchMeals };
}

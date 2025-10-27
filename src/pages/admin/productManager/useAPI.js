import { useState, useCallback } from "react";
import baseUrl from "@/api/instance";

export const useAPI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useCallback(async (method, url, payload = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseUrl({
        method,
        url,
        data: payload,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, api };
};

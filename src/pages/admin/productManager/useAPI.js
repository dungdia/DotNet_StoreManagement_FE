import { useState, useCallback } from "react";
import baseUrl from "@/api/instance";

export const useAPI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useCallback(async (method, url, payload = null, config = {}) => {
    setLoading(true);
    setError(null);

    var type = { ...config.headers };
    if (payload instanceof FormData) {
      type = { "Content-Type": "multipart/form-data", ...config.headers };
    }

    try {
      const response = await baseUrl({
        method,
        headers: type,
        ...config,
        url,
        data: payload,
      });
      // console.log(response.data);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { data, loading, error, api, setData };
};

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const useFetch = (url, options, action) => {
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(url, options || {});
      const resultJSONData = await response.json();
      setData(resultJSONData);
      if (action && typeof action === 'function') {
        dispatch(action(resultJSONData));
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, options, action]);

  return { data, error, isLoading };
};

export default useFetch;

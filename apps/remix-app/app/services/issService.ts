import axios, { isAxiosError, AxiosError } from 'axios';

interface ISSLocationResponse {
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
  timestamp: number;
}

export async function getISSLocation(
  url: string
): Promise<{ data: ISSLocationResponse | null; error: string | null }> {
  try {
    const response = await axios.get<ISSLocationResponse>(url);
    return { data: response.data, error: null };
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        data: null,
        error:
          (axiosError.response?.data as string) ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}

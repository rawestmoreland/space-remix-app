import axios, { AxiosError, isAxiosError } from 'axios';

export async function createContact(email: string) {
  try {
    const response = await axios.post(
      `${process.env.SENDFOX_BASE_URL}/contacts`,
      { email, lists: [535341] }, // List ID for the newsletter
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDFOX_PAT}`,
        },
      }
    );
    return { data: response.data, error: null };
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        data: null,
        error:
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}

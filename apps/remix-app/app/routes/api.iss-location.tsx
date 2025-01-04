import { json } from '@remix-run/node';
import { getISSLocation } from '~/services/issService';

export async function loader() {
  const { data, error } = await getISSLocation(
    'http://api.open-notify.org/iss-now.json'
  );
  return json({ data, error });
}

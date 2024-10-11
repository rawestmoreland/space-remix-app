import { json, useLoaderData } from '@remix-run/react';
import { prisma } from '~/db.server';

export const loader = async () => {
  const countries = await prisma.country.findMany();
  const agencies = await prisma.agency.findMany();

  return json({ countries, agencies });
};

export default function Countries() {
  const { countries, agencies } = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(countries, null, 2)}</pre>
      <pre>{JSON.stringify(agencies, null, 2)}</pre>
    </div>
  );
}

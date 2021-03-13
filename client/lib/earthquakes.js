export async function fetchEarthquakes(period, type) {
  // TODO sækja gögn frá proxy þjónustu
  let result;
  try {
    result = await fetch(`/proxy?period=${period}&type=${type}`);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data;
}

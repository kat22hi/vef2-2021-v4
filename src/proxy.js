// TODO útfæra proxy virkni
import express from 'express';
import fetch from 'node-fetch';
import { getCacheData, setCacheData } from './cache.js';
import { timerStart, timerEnd } from './time.js';

export const router = express.Router();

router.get('/proxy', async (req, res) => {

  const {
    period, type,
  } = req.query;

  const URL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${type}_${period}.geojson`;
  let result;

  const timerStarter = timerStart();
  try {
    result = await getCacheData(`${period}_${type}`);
  } catch (e) {
    console.error('error getting from cache', e);
  }

  if (result) {
    const data = {
      data: JSON.parse(result),
      info: {
        cached: true,
        time: timerEnd(timerStarter),
      },
    };
    res.json(data);
    return;
  }

  try {
    result = await fetch(URL);
  } catch (e) {
    console.error('Villa við að sækja gögn frá vefþjónustu', e);
    res.status(500).send('Villa við að sækja gögn frá vefþónustu');
    return;
  }

  if (!result.ok) {
    console.error('Villa frá vefþjónustu', await result.text());
    res.status(500).send('Villa við að sækja gögn frá vefþjónustu');
    return;
  }

  const results = await result.text();
  await setCacheData(`${period}_${type}`, results);

  const data = {
    data: JSON.parse(results),
    info: {
      cached: false,
      time: timerEnd(timerStarter),
    },
  };
  res.json(data);
});
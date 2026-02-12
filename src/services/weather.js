/**
 * 🍄 MYCOVITA OS v2.0 - WEATHER SERVICE
 * Open-Meteo API (Ücretsiz, API key gerektirmez)
 */

const config = require('../config');

// WMO Weather Codes → Türkçe
const WMO_CODES = {
  0: { main: 'Clear', description: 'Açık', icon: '☀️' },
  1: { main: 'Clear', description: 'Çoğunlukla Açık', icon: '🌤️' },
  2: { main: 'Clouds', description: 'Parçalı Bulutlu', icon: '⛅' },
  3: { main: 'Clouds', description: 'Bulutlu', icon: '☁️' },
  45: { main: 'Fog', description: 'Sisli', icon: '🌫️' },
  48: { main: 'Fog', description: 'Kırağılı Sis', icon: '🌫️' },
  51: { main: 'Drizzle', description: 'Hafif Çisenti', icon: '🌦️' },
  53: { main: 'Drizzle', description: 'Çisenti', icon: '🌦️' },
  55: { main: 'Drizzle', description: 'Yoğun Çisenti', icon: '🌦️' },
  61: { main: 'Rain', description: 'Hafif Yağmur', icon: '🌧️' },
  63: { main: 'Rain', description: 'Yağmurlu', icon: '🌧️' },
  65: { main: 'Rain', description: 'Şiddetli Yağmur', icon: '🌧️' },
  66: { main: 'Rain', description: 'Dondurucu Yağmur', icon: '🌧️' },
  67: { main: 'Rain', description: 'Şiddetli Dondurucu Yağmur', icon: '🌧️' },
  71: { main: 'Snow', description: 'Hafif Kar', icon: '🌨️' },
  73: { main: 'Snow', description: 'Karlı', icon: '❄️' },
  75: { main: 'Snow', description: 'Yoğun Kar', icon: '❄️' },
  77: { main: 'Snow', description: 'Kar Taneleri', icon: '❄️' },
  80: { main: 'Rain', description: 'Hafif Sağanak', icon: '🌦️' },
  81: { main: 'Rain', description: 'Sağanak Yağış', icon: '🌧️' },
  82: { main: 'Rain', description: 'Şiddetli Sağanak', icon: '🌧️' },
  85: { main: 'Snow', description: 'Hafif Kar Sağanağı', icon: '🌨️' },
  86: { main: 'Snow', description: 'Yoğun Kar Sağanağı', icon: '❄️' },
  95: { main: 'Thunderstorm', description: 'Gök Gürültülü Fırtına', icon: '⛈️' },
  96: { main: 'Thunderstorm', description: 'Dolu ile Fırtına', icon: '⛈️' },
  99: { main: 'Thunderstorm', description: 'Şiddetli Dolu Fırtınası', icon: '⛈️' }
};

const _cache = {};

function getWeatherDescription(code) {
  return WMO_CODES[code] || { main: 'Clear', description: 'Açık', icon: '🌤️' };
}

async function getWeather(location) {
  const cacheKey = `${location.name}_${new Date().getHours()}`;
  if (_cache[cacheKey]) return _cache[cacheKey];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/Istanbul&forecast_days=4`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.current) return null;

    const weatherInfo = getWeatherDescription(data.current.weather_code);
    const result = {
      location: location.name,
      current: {
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        description: weatherInfo.description,
        main: weatherInfo.main,
        icon: weatherInfo.icon,
        wind_speed: Math.round(data.current.wind_speed_10m),
        wind_gust: Math.round(data.current.wind_gusts_10m || 0)
      },
      forecast: []
    };

    if (data.daily?.time) {
      for (let i = 1; i < Math.min(4, data.daily.time.length); i++) {
        const dw = getWeatherDescription(data.daily.weather_code[i]);
        result.forecast.push({
          date: data.daily.time[i],
          temp_max: Math.round(data.daily.temperature_2m_max[i]),
          temp_min: Math.round(data.daily.temperature_2m_min[i]),
          main: dw.main, description: dw.description, icon: dw.icon
        });
      }
    }

    _cache[cacheKey] = result;
    return result;
  } catch (e) {
    console.error(`WeatherService Hata (${location.name}):`, e.message);
    return null;
  }
}

async function getAllLocations() {
  const results = [];
  for (const loc of config.weatherLocations) {
    const weather = await getWeather(loc);
    if (weather) results.push(weather);
  }
  return results;
}

module.exports = { getWeather, getAllLocations };

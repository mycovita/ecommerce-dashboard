/**
 * 🍄 MYCOVITA OS - WEATHER MODULE
 * Open-Meteo API (Ücretsiz, API key gerektirmez)
 */

const WeatherModule = {
  _cache: {},
  
  getWeather: function(location) {
    const cacheKey = `${location.name}_${new Date().getHours()}`;
    if (this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/Istanbul&forecast_days=4`;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      
      if (response.getResponseCode() !== 200) {
        LogModule.error(`Open-Meteo Hatası (${location.name}): ${response.getResponseCode()}`);
        return null;
      }
      
      const data = JSON.parse(response.getContentText());
      
      if (!data.current) {
        LogModule.warning(`Veri boş: ${location.name}`);
        return null;
      }
      
      const weatherInfo = this.getWeatherDescription(data.current.weather_code);
      
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
          wind_gust: Math.round(data.current.wind_gusts_10m || 0),
          precipitation: 0,
          uv_index: 0
        },
        forecast: []
      };
      
      // Günlük tahmin
      if (data.daily && data.daily.time) {
        for (let i = 1; i < Math.min(4, data.daily.time.length); i++) {
          const dayWeather = this.getWeatherDescription(data.daily.weather_code[i]);
          result.forecast.push({
            date: data.daily.time[i],
            temp_max: Math.round(data.daily.temperature_2m_max[i]),
            temp_min: Math.round(data.daily.temperature_2m_min[i]),
            main: dayWeather.main,
            description: dayWeather.description,
            icon: dayWeather.icon
          });
        }
      }
      
      this._cache[cacheKey] = result;
      return result;
      
    } catch(e) {
      LogModule.error("WeatherModule Hata: " + e.toString());
      return null;
    }
  },
  
  // WMO Weather Codes -> Türkçe
  getWeatherDescription: function(code) {
    const codes = {
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
    return codes[code] || { main: 'Clear', description: 'Açık', icon: '🌤️' };
  },
  
  getAllLocations: function() {
    const results = [];
    for (const loc of CONFIG.WEATHER_LOCATIONS) {
      const weather = this.getWeather(loc);
      if (weather) results.push(weather);
      Utilities.sleep(200);
    }
    return results;
  }
};

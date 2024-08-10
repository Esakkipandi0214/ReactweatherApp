import { useEffect, useState } from 'react';
import './index.css'; // Ensure Tailwind CSS is imported

// Define types for API responses
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  reportTime: string; // Add reportTime field
}

interface ForecastData {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string; // Date and time information
}

interface ForecastResponse {
  list: ForecastData[];
  city: {
    name: string;
  };
}

const predefinedCities = [ 'Kayathar', 'Tirunelveli','Coimbatore'];

function App() {
  const [data, setData] = useState<{ [key: string]: WeatherData }>({});
  const [forecast, setForecast] = useState<{ [key: string]: ForecastData[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // Current city for detailed view
  const apiKey = 'a3d85e39247755490f8497301a09d6a4'; // Replace with your OpenWeatherMap API key
  const apiKeyforWeek = 'a3d85e39247755490f8497301a09d6a4';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch weather and forecast data for all predefined cities
        for (const city of predefinedCities) {
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKeyforWeek}&units=metric`;

          const weatherResponse = await fetch(weatherUrl);
          if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
          }
          const weatherResult = await weatherResponse.json();
          const currentTime = new Date().toLocaleString();
          const weatherData: WeatherData = {
            ...weatherResult,
            reportTime: currentTime,
          };

          const forecastResponse = await fetch(forecastUrl);
          if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
          }
          const forecastResult: ForecastResponse = await forecastResponse.json();

          setData(prevData => ({ ...prevData, [city]: weatherData }));
          setForecast(prevForecast => ({ ...prevForecast, [city]: forecastResult.list.slice(0, 5) }));
        }
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    fetchAllData();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleCityClick = (city: string) => {
    // Toggle the selected city; set to null if already selected
    setSelectedCity(prevCity => (prevCity === city ? null : city));
  };

  return (
    <div className="App flex min-h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
      <div className="w-1/4 bg-gray-800 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Weather Data</h1>
        <h2 className="text-xl mb-6">Select a city to view details</h2>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="space-y-4">
          {Object.keys(data).map((cityName) => (
            <div
              key={cityName}
              className={`bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 ${
                selectedCity === cityName ? 'border-2 border-yellow-400' : ''
              }`}
              onClick={() => handleCityClick(cityName)}
            >
              <h3 className="text-xl font-semibold mb-2">{data[cityName].name}</h3>
              <p className="text-sm mb-1">Weather: {data[cityName].weather[0].description}</p>
              <p className="text-sm">Report Time: {data[cityName].reportTime}</p>
              <div className="flex justify-between mt-4">
                <div className="text-cyan-300">
                  <p className="text-lg font-semibold">Temp</p>
                  <p className="text-xl">{data[cityName].main.temp}°C</p>
                </div>
                <div className="text-green-300">
                  <p className="text-lg font-semibold">Humidity</p>
                  <p className="text-xl">{data[cityName].main.humidity}%</p>
                </div>
                <div className="text-orange-300">
                  <p className="text-lg font-semibold">Wind</p>
                  <p className="text-xl">{data[cityName].wind.speed} m/s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-3/4 p-6">
        {selectedCity && forecast[selectedCity] && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">5-Day Forecast for {selectedCity}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Weather</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Temperature</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Humidity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Wind Speed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecast[selectedCity].map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(item.dt * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.dt * 1000).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.weather[0].description}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.main.temp}°C
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.main.humidity}%
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.wind.speed} m/s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

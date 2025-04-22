import React, { useState, useEffect } from 'react';
import '../../App.css';

export default function Bluetooth() {
  const [device, setDevice] = useState(null);
  const [runningData, setRunningData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Connect to Arduino via Bluetooth (HC-05)
  const connectToBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'HC-05' }],
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'], // UUID for Serial Port Profile (SPP)
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = new TextDecoder().decode(event.target.value);
        try {
          const data = JSON.parse(value);
          setRunningData(data);
        } catch (e) {
          setError('Failed to parse Bluetooth data');
        }
      });
      setDevice(device);
    } catch (err) {
      setError('Bluetooth connection failed: ' + err.message);
    }
  };

  // Fetch data from Flask backend
  const fetchBackendData = async () => {
    try {
      const dataResponse = await fetch('http://localhost:5000/data');
      const statsResponse = await fetch('http://localhost:5000/stats');
      const data = await dataResponse.json();
      const stats = await statsResponse.json();
      if (data.length > 0) {
        setRunningData(data[data.length - 1]); // Get the latest data point
      }
      setStats(stats);
    } catch (err) {
      setError('Failed to fetch data from backend: ' + err.message);
    }
  };

  // Fetch data every 5 seconds if not using Bluetooth
  useEffect(() => {
    if (!device) {
      fetchBackendData();
      const interval = setInterval(fetchBackendData, 5000);
      return () => clearInterval(interval);
    }
  }, [device]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Running Tracker</h1>

      {/* Bluetooth Connection Button */}
      <button
        onClick={connectToBluetooth}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        {device ? 'Connected to HC-05' : 'Connect to Arduino via Bluetooth'}
      </button>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Display Running Data */}
      {runningData ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Live Running Data</h2>
          <p><strong>Latitude:</strong> {runningData.lat}</p>
          <p><strong>Longitude:</strong> {runningData.lng}</p>
          <p><strong>Speed:</strong> {runningData.speed} km/h</p>
          <p><strong>Heart Rate:</strong> {runningData.heartRate} BPM</p>
          <p><strong>Distance:</strong> {runningData.distance} km</p>
          <p><strong>Time:</strong> {runningData.time} seconds</p>
        </div>
      ) : (
        <p className="text-gray-500">No live data available. Connect to Bluetooth or wait for backend data...</p>
      )}

      {/* Display Stats from Backend */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mt-4">
          <h2 className="text-xl font-semibold mb-4">Running Stats</h2>
          <p><strong>Total Distance:</strong> {stats.total_distance.toFixed(2)} km</p>
          <p><strong>Total Time:</strong> {Math.floor(stats.total_time / 60)}:{(stats.total_time % 60).toFixed(0)} (mm:ss)</p>
          <p><strong>Calories Burned:</strong> {stats.calories.toFixed(2)} kcal</p>
          <p><strong>Average Heart Rate:</strong> {stats.avg_heart_rate.toFixed(0)} BPM</p>
          <p><strong>BMI:</strong> {stats.bmi.toFixed(1)}</p>
          <p><strong>Diet Plan:</strong> {stats.diet_plan}</p>
          <p><strong>Exercise Plan:</strong> {stats.exercise_plan}</p>
        </div>
      )}
    </div>
  );
}
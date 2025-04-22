import { useEffect, useState } from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: '100%',
  height: '500px'
};

const MapComponent = () => {
  const [path, setPath] = useState([]);
  const [stats, setStats] = useState({
    distance: 0,
    time: 0,
    calories: 0,
    heartRate: 0,
    bmi: 0,
    diet: "",
    exercise: ""
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/data")
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setPath(data.map(d => ({ lat: d.lat, lng: d.lng })));
          }
        });

      fetch("http://localhost:5000/stats")
        .then(res => res.json())
        .then(data => {
          setStats({
            distance: data.total_distance.toFixed(2),
            time: (data.total_time / 60).toFixed(1), // Minutes
            calories: data.calories.toFixed(0),
            heartRate: data.avg_heart_rate.toFixed(0),
            bmi: data.bmi.toFixed(1),
            diet: data.diet_plan,
            exercise: data.exercise_plan
          });
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <h2>Running Tracker</h2>
      <div>
        <p>Distance: {stats.distance} km</p>
        <p>Time: {stats.time} minutes</p>
        <p>Calories: {stats.calories} kcal</p>
        <p>Avg Heart Rate: {stats.heartRate} bpm</p>
        <p>BMI: {stats.bmi}</p>
        <p>Diet Plan: {stats.diet}</p>
        <p>Exercise Plan: {stats.exercise}</p>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={path.length ? path[path.length - 1] : { lat: 10.7769, lng: 106.7009 }}
        zoom={16}
      >
        <Polyline path={path} options={{ strokeColor: "#FF0000" }} />
        {path.length > 0 && <Marker position={path[path.length - 1]} />}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
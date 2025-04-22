#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <math.h> // Thêm thư viện toán học

TinyGPSPlus gps;
SoftwareSerial ss(4, 3); // RX, TX for GPS
SoftwareSerial bt(10, 11); // RX, TX for Bluetooth HC-05

int pulsePin = A0;
int heartRate = 0;
unsigned long startTime = 0;
float totalDistance = 0;
float lastLat = 0, lastLng = 0;
bool isRunning = false;

float calcDistance(float lat1, float lon1, float lat2, float lon2) {
  float R = 6371e3; // Earth's radius in meters
  float phi1 = lat1 * PI / 180;
  float phi2 = lat2 * PI / 180;
  float deltaPhi = (lat2 - lat1) * PI / 180;
  float deltaLambda = (lon2 - lon1) * PI / 180;
  float a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
            cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
  float c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c; // Distance in meters
}

void setup() {
  Serial.begin(9600);
  ss.begin(9600);
  bt.begin(9600); // Bluetooth
  startTime = millis();
}

void loop() {
  while (ss.available() > 0) {
    gps.encode(ss.read());
  }

  heartRate = analogRead(pulsePin);
  heartRate = map(heartRate, 0, 1023, 60, 200); // Calibrate to realistic BPM

  if (gps.location.isUpdated()) {
    float lat = gps.location.lat();
    float lng = gps.location.lng();
    float speed = gps.speed.kmph();
    unsigned long currentTime = (millis() - startTime) / 1000; // Seconds

    if (lastLat != 0 && lastLng != 0) {
      totalDistance += calcDistance(lastLat, lastLng, lat, lng) / 1000; // km
    }
    lastLat = lat;
    lastLng = lng;

    // Send JSON data to Serial (Flask) and Bluetooth (phone)
    String data = "{\"lat\":" + String(lat, 6) + ",\"lng\":" + String(lng, 6) +
                  ",\"speed\":" + String(speed, 2) + ",\"heartRate\":" + String(heartRate) +
                  ",\"distance\":" + String(totalDistance, 2) + ",\"time\":" + String(currentTime) + "}";
    Serial.println(data);
    bt.println(data);
  }

  delay(1000);
}
#include <DHT.h>

#define DHTPIN 2         // Digital pin connected to the DHT sensor
#define RELAY_PIN 7      // Digital pin connected to the relay control
#define TEMP_THRESHOLD 30  // Temperature threshold in degrees Celsius

DHT dht(DHTPIN, DHT11);

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Initialize relay as OFF
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temperature = dht.readTemperature();
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  
  if (!isnan(temperature)) {
    if (temperature > TEMP_THRESHOLD) {
      digitalWrite(RELAY_PIN, HIGH);  // Turn ON the relay (open valve)
      Serial.println("Valve OPEN");
    } else {
      digitalWrite(RELAY_PIN, LOW);   // Turn OFF the relay (close valve)
      Serial.println("Valve CLOSED");
    }
  } else {
    Serial.println("Error reading temperature!");
  }
  
  delay(1000);  // Adjust the delay as needed
}

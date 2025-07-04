[
  "#include <Wire.h>",
  "#include <LiquidCrystal_I2C.h>",
  "#include <DHT.h>",
  "#include <Servo.h>",
  "",
  "#define PIR_PIN D2           // PIR sensor data pin",
  "#define DHT_PIN D3          // DHT22 data pin",
  "#define LDR_PIN A0          // LDR sensor pin",
  "#define TRIG_PIN D5         // Ultrasonic trigger pin",
  "#define ECHO_PIN D6         // Ultrasonic echo pin",
  "#define SERVO_PIN D4        // Servo motor position pin",
  "",
  "// Create objects",
  "LiquidCrystal_I2C lcd(0x27, 16, 2);  // Adjust address if needed",
  "DHT dht(DHT_PIN, DHT22);",
  "Servo myServo;",
  "",
  "bool motionDetected = false;",
  "",
  "void setup() {",
  "    Serial.begin(9600);              // Start serial communication",
  "    lcd.begin();                     // Initialize the LCD",
  "    dht.begin();                     // Initialize the DHT sensor",
  "    myServo.attach(SERVO_PIN);      // Attach the servo motor",
  "",
  "    pinMode(PIR_PIN, INPUT);        // Set PIR pin as input",
  "    lcd.print(\"System Ready\");      // Display on LCD",
  "}",
  "",
  "void loop() {",
  "    // Read PIR sensor",
  "    motionDetected = digitalRead(PIR_PIN);",
  "    if (motionDetected) {",
  "        lcd.clear();",
  "        lcd.print(\"Motion Detected\");",
  "        myServo.write(90);           // Move servo to trigger an alarm or camera",
  "        delay(2000);                 // Keep it active for 2 seconds",
  "        myServo.write(0);            // Return servo to initial position",
  "    } else {",
  "        lcd.clear();",
  "        lcd.print(\"No Motion\");",
  "    }",
  "  ",
  "    // Optional: Read and print DHT22 and LDR data",
  "    float humidity = dht.readHumidity();",
  "    float temperature = dht.readTemperature();",
  "    int ldrValue = analogRead(LDR_PIN);",
  "  ",
  "    Serial.print(\"Humidity: \");",
  "    Serial.print(humidity);",
  "    Serial.print(\"% Temperature: \");",
  "    Serial.print(temperature);",
  "    Serial.print(\"°C LDR Value: \");",
  "    Serial.println(ldrValue);",
  "    ",
  "    delay(1000); // Delay between readings",
  "}"
]
import { useState, useEffect } from "react";
import mqtt, { MqttClient } from "mqtt";

export function useMqttOutputs() {
  const [data, setData] = useState({
    napkinCurrent: 0,
    napkinLast: 0,
    pantsCurrent: 0,
    pantsLast: 0,
    Line1: 0,
    Line3: 0,
    Line4: 0,
    Line5: 0,
    Line6: 0,
    Line7: 0,
    Line8: 0,
    Line9: 0,
    Line10: 0,
    Line11: 0,
  });

  useEffect(() => {
    const client: MqttClient = mqtt.connect("ws://172.17.173.164:443");

    client.on("connect", () => {
      console.log("MQTT connected");
      const topics = [
        "AMG/Speed/Current_Napkin",
        "AMG/Speed/Last_Napkin",
        "AMG/Speed/Current_Pants",
        "AMG/Speed/Last_Pants",
        "AMG/Speed/Line1",
        "AMG/Speed/Line3",
        "AMG/Speed/Line4",
        "AMG/Speed/Line5",
        "AMG/Speed/Line6",
        "AMG/Speed/Line7",
        "AMG/Speed/Line8",
        "AMG/Speed/Line9",
        "AMG/Speed/Line10",
        "AMG/Speed/Line11",
      ];
      topics.forEach((t) => client.subscribe(t));
    });

<<<<<<< HEAD
     client.on("message", (topic, message) => {
      let value = 0;
      try {
        const parsed = JSON.parse(message.toString());
        value = Number(parsed.value) || 0;
      } catch (err) {
        console.error("Failed to parse MQTT message:", message.toString(), err);
        value = 0;
      }
=======
    client.on("message", (topic, message) => {
  try {
    const parsed = JSON.parse(message.toString());
    const value = parsed?.value !== undefined ? Number(parsed.value) : 0;

    setData((prev) => {
      const newData = {
        ...prev,
        ...(topic === "AMG/Speed/Line1" && { Line1: 800 }),
        ...(topic === "AMG/Speed/Line3" && { Line3: value }),
        ...(topic === "AMG/Speed/Line4" && { Line4: value }),
        ...(topic === "AMG/Speed/Line5" && { Line5: value }),
        ...(topic === "AMG/Speed/Line6" && { Line6: value }),
        ...(topic === "AMG/Speed/Line7" && { Line7: value }),
        ...(topic === "AMG/Speed/Line8" && { Line8: value }),
        ...(topic === "AMG/Speed/Line9" && { Line9: value }),
        ...(topic === "AMG/Speed/Line10" && { Line10: value }),
        ...(topic === "AMG/Speed/Line11" && { Line11: value }),
        ...(topic === "AMG/Speed/Current_Napkin" && { napkinCurrent: value }),
        ...(topic === "AMG/Speed/Last_Napkin" && { napkinLast: value }),
        ...(topic === "AMG/Speed/Current_Pants" && { pantsCurrent: value }),
        ...(topic === "AMG/Speed/Last_Pants" && { pantsLast: value }),
      };
>>>>>>> 068dcd745265cce96eaa5de3ccf394c91b829b80

      console.log(`MQTT update [${topic}]:`, value);
      return newData;
    });
  } catch (err) {
    console.error("Failed to parse MQTT message:", message.toString(), err);
    
  }
});

    // Cleanup
    return () => {
      client.end(); // tutup koneksi MQTT saat unmount
    };
  }, []);

  return data;
}
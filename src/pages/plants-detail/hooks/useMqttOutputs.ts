import { useState, useEffect } from "react";
import mqtt from "mqtt";

export function useMqttOutputs() {
  const [data, setData] = useState({
    napkinCurrent: 0,
    napkinLast: 0,
    pantsCurrent: 0,
    pantsLast: 0,
  });

  useEffect(() => {
    const client = mqtt.connect("ws://172.17.173.164:443");

    client.on("connect", () => {
      client.subscribe("AMG/Speed/Current_Napkin");
      client.subscribe("AMG/Speed/Last_Napkin");
      client.subscribe("AMG/Speed/Current_Pants");
      client.subscribe("AMG/Speed/Last_Pants");
    });

    client.on("message", (topic, message) => {
      const value = Number(message.toString());

      setData((prev) => {
        switch (topic) {
          case "AMG/Speed/Current_Napkin":
            return { ...prev, napkinCurrent: value };
          case "AMG/Speed/Last_Napkin":
            return { ...prev, napkinLast: value };
          case "AMG/Speed/Current_Pants":
            return { ...prev, pantsCurrent: value };
          case "AMG/Speed/Last_Pants":
            return { ...prev, pantsLast: value };
          default:
            return prev;
        }
      });
    });

    return () => {
      client.end();
    };
  }, []);

  return data;
}
import { useState, useEffect } from "react";
import mqtt from "mqtt";

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
    const client = mqtt.connect("ws://172.17.173.164:443");

    client.on("connect", () => {
      client.subscribe("AMG/Speed/Current_Napkin");
      client.subscribe("AMG/Speed/Last_Napkin");
      client.subscribe("AMG/Speed/Current_Pants");
      client.subscribe("AMG/Speed/Last_Pants");
      client.subscribe("AMG/Speed/L1");
      client.subscribe("AMG/Speed/L3");
      client.subscribe("AMG/Speed/L4");
      client.subscribe("AMG/Speed/L5");
      client.subscribe("AMG/Speed/L6");
      client.subscribe("AMG/Speed/L7");
      client.subscribe("AMG/Speed/L8");
      client.subscribe("AMG/Speed/L9");
      client.subscribe("AMG/Speed/L10");
      client.subscribe("AMG/Speed/L11");

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
          case "AMG/Speed/L1":
            return { ...prev, Line1: value };
          case "AMG/Speed/L3":
            return { ...prev, Line3: value };
          case "AMG/Speed/L4":
            return { ...prev, Line4: value };
          case "AMG/Speed/L5":
            return { ...prev, Line5: value };
          case "AMG/Speed/L6":
            return { ...prev, Line6: value };
          case "AMG/Speed/L7":
            return { ...prev, Line7: value };
          case "AMG/Speed/L8":
            return { ...prev, Line8: value };
          case "AMG/Speed/L9":
            return { ...prev, Line9: value };
          case "AMG/Speed/L10":
            return { ...prev, Line10: value };
          case "AMG/Speed/L11":
            return { ...prev, Line11: value };
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
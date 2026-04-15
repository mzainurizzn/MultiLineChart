export const topicMap = {
  "AMG/Speed/Current_Napkin": "napkinCurrent",
  "AMG/Speed/Last_Napkin": "napkinLast",
  "AMG/Speed/Current_Pants": "pantsCurrent",
  "AMG/Speed/Last_Pants": "pantsLast",

  "AMG/Speed/L1": "Line1",
  "AMG/Speed/L3": "Line3",
  "AMG/Speed/L4": "Line4",
  "AMG/Speed/L5": "Line5",
  "AMG/Speed/L6": "Line6",
  "AMG/Speed/L7": "Line7",
  "AMG/Speed/L8": "Line8",
  "AMG/Speed/L9": "Line9",
  "AMG/Speed/L10": "Line10",
  "AMG/Speed/L11": "Line11",

  "AMG/Speed/Line1_Cur_Tot": "Total1",
  "AMG/Speed/Line3_Cur_Tot": "Total3",
  "AMG/Speed/Line4_Cur_Tot": "Total4",
  "AMG/Speed/Line5_Cur_Tot": "Total5",
  "AMG/Speed/Line6_Cur_Tot": "Total6",
  "AMG/Speed/Line7_Cur_Tot": "Total7",
  "AMG/Speed/Line8_Cur_Tot": "Total8",
  "AMG/Speed/Line9_Cur_Tot": "Total9",
  "AMG/Speed/Line10_Cur_Tot": "Total10",
  "AMG/Speed/Line11_Cur_Tot": "Total11",
} as const;

// 🔥 type otomatis dari value
export type MqttDataKey = typeof topicMap[keyof typeof topicMap];
export type MqttData = {
  [K in MqttDataKey]: number;
};
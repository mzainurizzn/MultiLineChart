export type OeeApiItem = {
  month_period: string;
  plant: string;
  cu_pct: number | string;
  oee_pct: number | string;
  oee_tgt: number | string;
  cu_tgt: number | string;
};

export type OeeKetItem = {
  plant: string;
  ket_cu: string;
  ket_oee: string;
  ket_plant: string;
};

export type OeeApiResponse = {
  success: boolean;
  count: number;
  data: OeeApiItem[];
  ket?: OeeKetItem[];
};

export type OeeMonthly = {
  month: number;
  year: number;
  label: string;
  oee: number;
  cu: number;
  oeeTgt: number;
  cuTgt: number;
};

export type PlantOeeResult = {
  series: OeeMonthly[];
  ket: OeeKetItem | null;
};

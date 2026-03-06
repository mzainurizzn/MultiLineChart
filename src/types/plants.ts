export type PlantApiResponse = {
  success: boolean;
  count: number;
  plants: string[];
};

export type Plant = {
  id: string;
  name: string;
};

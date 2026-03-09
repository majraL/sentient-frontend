export type Brand = {
  id: string;
  name: string;
  status: "active" | "inactive";
  averageSentiment: number;
  activeTasks: number;
};

export type BrandsResponse = Brand[];

export interface IDashboard {
  activity: string;
  start_date: Date;
  estimated_time: string
}

export interface IProvinceData {
  label: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

declare module '@/components/ActivityChart' {
  import { FC } from 'react';
  
  interface ActivityData {
    day: string;
    interactions: number;
    leads: number;
  }

  interface ActivityChartProps {
    data: ActivityData[];
  }

  const ActivityChart: FC<ActivityChartProps>;
  export default ActivityChart;
}

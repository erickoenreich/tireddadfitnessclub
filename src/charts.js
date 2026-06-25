import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

export const CHART_FONT = { size: 11 };

export const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

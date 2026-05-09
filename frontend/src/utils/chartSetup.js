// Create new file: chartSetup.js
import {
  Chart,
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";

let chartInitialized = false;

export async function initializeChart() {
  if (chartInitialized) return;

  Chart.register(
    DoughnutController,
    BarController,
    LineController,
    ArcElement,
    BarElement,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
  );

  chartInitialized = true;
}

export { Chart };

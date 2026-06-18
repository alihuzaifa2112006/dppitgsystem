import PropTypes from 'prop-types';

import { styled, useTheme } from '@mui/material/styles';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 380;

const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    marginBottom: theme.spacing(3),
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function ChartRadarBar({ series }) {
  const theme = useTheme();

  const chartOptions = useChart({
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.48,
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    xaxis: {
      categories: [
        'No. of employee',
        'No. of machine',
        'FPF',
        'Years in Business',
        'Business in EU',
        'Business in USA',
        'Certification',
      ],
      labels: {
        style: {
          colors: [
            theme.palette.text.secondary,
            theme.palette.text.secondary,
            theme.palette.text.secondary,
            theme.palette.text.secondary,
            theme.palette.text.secondary,
            theme.palette.text.secondary,
          ],
        },
      },
    },
  });

  return (
    <StyledChart
      dir="ltr"
      type="radar"
      series={series}
      options={chartOptions}
      width="100%"
      height={400}
      sx={{ mt: -10 }}
    />
  );
}

ChartRadarBar.propTypes = {
  series: PropTypes.array,
};

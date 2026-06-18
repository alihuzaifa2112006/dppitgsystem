import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InspectionPerformanceKSP({
  title,
  subheader,
  chart,
  selectedPerson,
  onSelectPerson,
  ...other
}) {
  const theme = useTheme();

  const {
    colors = [
      [theme.palette.primary.light, theme.palette.primary.main],
      [theme.palette.warning.light, theme.palette.warning.main],
      [theme.palette.info.light, theme.palette.info.main],
      [theme.palette.error.light, theme.palette.error.main],
      [theme.palette.success.light, theme.palette.success.main],
    ],
    categories,
    series,
    options,
  } = chart;

  const popover = usePopover();

  // Initialize with the first salesperson
  // const [selectedPerson, setSelectedPerson] = useState(series[0]?.year || '');

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[1]),
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: colors.map((colr) => [
          { offset: 0, color: colr[0], opacity: 1 },
          { offset: 100, color: colr[1], opacity: 1 },
        ]),
      },
    },
    xaxis: {
      categories,
    },
    ...options,
  });

  const handleChangePerson = useCallback(
    (newValue) => {
      popover.onClose();
      onSelectPerson(newValue);
    },
    [popover, onSelectPerson]
  );

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            series?.length > 0 && (
              <ButtonBase
                onClick={popover.onOpen}
                sx={{
                  pl: 1,
                  py: 0.5,
                  pr: 0.5,
                  borderRadius: 1,
                  typography: 'subtitle2',
                  bgcolor: 'background.neutral',
                }}
              >
                {selectedPerson || 'Alnoor'}
                <Iconify
                  width={16}
                  icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                  sx={{ ml: 0.5 }}
                />
              </ButtonBase>
            )
          }
        />

        {series?.map((item) => (
          <Box key={item.year} sx={{ mt: 3, mx: 3 }}>
            {item.year === selectedPerson && (
              <Chart
                dir="ltr"
                type="bar"
                series={item.data}
                options={chartOptions}
                width="100%"
                height={398}
              />
            )}
          </Box>
        ))}
      </Card>

      {series?.length > 0 && (
        <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
          {series?.map((option) => (
            <MenuItem
              key={option.year}
              selected={option.year === selectedPerson}
              onClick={() => handleChangePerson(option.year)}
            >
              {option.year}
            </MenuItem>
          ))}
        </CustomPopover>
      )}
    </>
  );
}

InspectionPerformanceKSP.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  selectedPerson: PropTypes.string,
  onSelectPerson: PropTypes.func,
};

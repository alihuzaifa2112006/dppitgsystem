import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
// import RptDialog from '../ReportDialog';
import { Box } from '@mui/system';
import PrRequestGrid from '../CostingPlan-sheet-grid';


// ----------------------------------------------------------------------

export default function CostingPlanGridView() {
  const settings = useSettingsContext();

  const [isSuperSearchEnabled, setIsSuperSearchEnabled] = useState(
    () => JSON.parse(localStorage.getItem('isSuperSearchEnabled')) || true
  );

  // Handle toggle change
  const handleToggleChange = (event) => {
    const newValue = event.target.checked;
    setIsSuperSearchEnabled(newValue);
    localStorage.setItem('isSuperSearchEnabled', JSON.stringify(newValue));
  };

  useEffect(() => {
    // Sync state with localStorage on mount
    const storedValue = JSON.parse(localStorage.getItem('isSuperSearchEnabled'));
    if (storedValue !== null) {
      setIsSuperSearchEnabled(storedValue);
    }
  }, []);

  //  Dialog Functions
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading=" Material Price List"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Material Price List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >

            <Button
              component={RouterLink}
              href={paths.dashboard.AIPlans.CostingPlan.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
             Create Material Price
            </Button>
          </Box>
        }
      />

      <PrRequestGrid />
      {/* <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} /> */}
    </Container>
  );
}

// superSearch={isSuperSearchEnabled}
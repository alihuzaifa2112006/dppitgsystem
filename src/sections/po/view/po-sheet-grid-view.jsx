import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import PoGrid from '../po-sheet-grid';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import RptDialog from '../ReportDialog';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

export default function PoGridView() {
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
        heading="Purchase Order Sheet"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Purchase Order' },
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
            {/* <Button
              variant="contained"
              startIcon={<Iconify icon="uiw:file-excel" />}
              color="primary"
              onClick={handleDialogOpen}
              sx={{ height: '38px' }}
            >
              Export Excel
            </Button> */}
            <Button
              component={RouterLink}
              href={paths.dashboard.procurement.po.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Add Purchase Order
            </Button>
          </Box>
        }
      />

      <PoGrid superSearch={isSuperSearchEnabled} />
      <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} />
    </Container>
  );
}

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import RptDialog from '../ReportDialog';
import { Box } from '@mui/system';
import ELCGrid from '../elc-sheet-grid';

// ----------------------------------------------------------------------

export default function ELCGridView() {
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
        heading="L/C Tagging"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'L/C Tagging',
            href: paths.dashboard.Commercial.export.ExportLC.root,
          },
          { name: 'List' },
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
              href={paths.dashboard.Commercial.export.ExportLC.new}
              variant="contained"
              startIcon={<Iconify icon="pepicons-pencil:plus" />}
              color="primary"
            >
              Add L/C Tagging
            </Button>
          </Box>
        }
      />

      <ELCGrid superSearch={isSuperSearchEnabled} />
      <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} />
    </Container>
  );
}

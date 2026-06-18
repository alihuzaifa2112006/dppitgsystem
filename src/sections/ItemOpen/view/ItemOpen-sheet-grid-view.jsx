import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import ItemOpenListView from '../ItemOpen-sheet-grid';
import { Box } from '@mui/system';
import RptDialog from '../ReportDialog';

// ----------------------------------------------------------------------

export default function ItemOpenGridView() {
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

  // Upload Dialog Functions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  // Upload Dialog Functions
  const [dialogRptOpen, setDialogRptOpen] = useState(false);

  const handleRptDialogOpen = () => {
    setDialogRptOpen(true);
  };

  const handleRptDialogClose = () => {
    setDialogRptOpen(false);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Transaction "
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Item Transaction ' },
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
              variant="contained"
              startIcon={<Iconify icon="mingcute:file-import-line" />}
              color="primary"
              onClick={handleUploadDialogOpen}
            >
              Import Excel
            </Button>
            {/* <Button
              variant="contained"
              startIcon={<Iconify icon="uiw:file-excel" />}
              color="primary"
              onClick={handleRptDialogOpen}
            >
              Stock Report
            </Button> */}
            <Button
              component={RouterLink}
              href={paths.dashboard.InventoryManagement.ItemOpen.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              New Transaction
            </Button>
          </Box>
        }
      />

      <ItemOpenListView
        superSearch={isSuperSearchEnabled}
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
      />
      <RptDialog uploadClose={handleRptDialogClose} uploadOpen={dialogRptOpen} />
    </Container>
  );
}

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

import ProductionOrderListView from '../production-sheet-grid';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export default function ProductionOpenGridView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const [isSuperSearchEnabled, setIsSuperSearchEnabled] = useState(
    () => JSON.parse(localStorage.getItem('isSuperSearchEnabled')) || true
  );
  const handleDialogOpen = () => {
    navigate(paths.dashboard.Production.Planning.production.new)
  };
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Production"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Production', href: paths.dashboard.Production.Planning.production.root },
          { name: 'list' },
        ]}
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
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleDialogOpen}
              color="primary"
            >
              Add Production
            </Button>
          </Box>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ProductionOrderListView />
    </Container>
  );
}

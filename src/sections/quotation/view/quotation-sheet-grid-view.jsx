import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import QuotationGrid from '../quotation-sheet-grid';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function QuotationGridView() {
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Quotation Sheet"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Quotation View' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.transaction.quotation.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            color="primary"
          >
            Add Quotation
          </Button>
        }
      />

      <QuotationGrid superSearch={isSuperSearchEnabled} />
    </Container>
  );
}

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import ItemReturnAcknowledgementGrid from '../ItemReturnAcknowledgement-sheet-grid';

// ----------------------------------------------------------------------

export default function ItemReturnAcknowledgementGridView() {
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
        heading="Stock Acknowledgement"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Stock Acknowledgement' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
       
      />

      <ItemReturnAcknowledgementGrid superSearch={isSuperSearchEnabled} />
    </Container>
  );
}

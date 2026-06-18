import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import PricelistGrid from '../priceList-sheet-grid';



// ----------------------------------------------------------------------

export default function PricelistGridView() {

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
                heading="Pricelist Sheet"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    { name: 'Pricelist View' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
                // action={
                //     <FormControlLabel
                //         control={
                //             <Switch
                //                 checked={isSuperSearchEnabled}
                //                 onChange={handleToggleChange}
                //                 color="primary"
                //             />
                //         }
                //         label="Super Search"
                //     />
                // }
            />

            <PricelistGrid superSearch={isSuperSearchEnabled} />

        </Container>
    );
}
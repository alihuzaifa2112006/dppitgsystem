import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PiCreateForm from '../pi-new';


// ----------------------------------------------------------------------

export default function PiNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Proforma Invoice"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Proforma Invoice',
                        href: paths.dashboard.transaction.pi.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <PiCreateForm />
        </Container>
    );
}

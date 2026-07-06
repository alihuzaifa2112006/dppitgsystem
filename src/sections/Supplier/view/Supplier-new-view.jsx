import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import SupplierCreateForm from '../Supplier-new';


// ----------------------------------------------------------------------

export default function SupplierNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Supply Chain Network Onboard "
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Supply Chain Network Onboard List',
                        href: paths.dashboard.Onboarding.Supplier.root,
                    },
                    { name: 'Onboard' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <SupplierCreateForm />
        </Container>
    );
}



// Blowroom new vieee 

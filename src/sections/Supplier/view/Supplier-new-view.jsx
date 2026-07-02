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
                heading="Pre On Boarding "
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Pre On Boarding List',
                        href: paths.dashboard.Onboarding.Supplier.root,
                    },
                    { name: 'Board' },
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

import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductCreateForm from '../vendor-new';


// ----------------------------------------------------------------------

export default function VendorNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Vendor"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Vendor ', href: paths.dashboard.admin.vendor.root },
                    { name: 'Add' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductCreateForm />
        </Container>
    );
}

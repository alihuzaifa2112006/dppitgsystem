import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import CustomerCreateForm from '../customer-new';


// ----------------------------------------------------------------------

export default function CustomerNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Walk-In Customer"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'WIC', href: paths.dashboard.customer.root },
                    { name: 'Add' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <CustomerCreateForm />
        </Container>
    );
}

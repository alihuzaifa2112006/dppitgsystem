import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import WICCreateForm from '../wic-new';


// ----------------------------------------------------------------------

export default function WICNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Walk-In Customer"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Walk-In Customer', href: paths.dashboard.customer.wic.root },
                    { name: 'Add' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <WICCreateForm />
        </Container>
    );
}

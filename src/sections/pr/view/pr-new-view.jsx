import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PrCreateForm from '../pr-new';


// ----------------------------------------------------------------------

export default function PrNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Purchase Request"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Purchase Request',
                        href: paths.dashboard.procurement.pr.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <PrCreateForm />
        </Container>
    );
}

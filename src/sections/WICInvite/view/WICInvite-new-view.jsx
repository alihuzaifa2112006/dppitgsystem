import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import WICInviteCreateForm from '../WICInvite-new';


// ----------------------------------------------------------------------

export default function WICInviteNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Onboard Customer"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Onboard Customer', href: paths.dashboard.customer.inviteWIC.root },
                    { name: 'Add' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <WICInviteCreateForm />
        </Container>
    );
}

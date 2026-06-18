import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import WICInviteEditForm from '../WICInvite-edit';

// ----------------------------------------------------------------------

export default function WICInviteEditView({ urlData }) {

    const settings = useSettingsContext();
    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
               <CustomBreadcrumbs
                heading="Edit Onboard Customer"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Onboard Customer', href: paths.dashboard.customer.inviteWIC.root },
                    { name: 'Edit' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <WICInviteEditForm urlData={urlData} />

        </Container>
    );
}

WICInviteEditView.propTypes = {
    urlData: PropTypes.any,
}
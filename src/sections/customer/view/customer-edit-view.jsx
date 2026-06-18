import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CustomerEditForm from '../customer-edit';

// ----------------------------------------------------------------------

export default function CustomerEditView({ urlData }) {

    const settings = useSettingsContext();
    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
               <CustomBreadcrumbs
                heading="Edit Walk-In Customer"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Customer', href: paths.dashboard.customer.root },
                    { name: 'Edit' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <CustomerEditForm urlData={urlData} />

        </Container>
    );
}

CustomerEditView.propTypes = {
    urlData: PropTypes.any,
}
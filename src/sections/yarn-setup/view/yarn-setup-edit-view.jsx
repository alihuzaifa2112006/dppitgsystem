import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import YarnSetupEditForm from '../yarn-setup-edit';

// ----------------------------------------------------------------------

export default function YarnSetupEditView({ urlData }) {

    const settings = useSettingsContext();
    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
               <CustomBreadcrumbs
                heading="Edit Yarn Setup"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Yarn Setup',
                        href: paths.dashboard.yarnModule.yarnSetup.root,
                    },
                    { name: 'Edit' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <YarnSetupEditForm urlData={urlData} />

        </Container>
    );
}

YarnSetupEditView.propTypes = {
    urlData: PropTypes.any,
}
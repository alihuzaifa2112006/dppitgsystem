import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import YarnContractEditForm from '../yarn-contract-edit';

// ----------------------------------------------------------------------

export default function YarnContractEditView({ urlData }) {

    const settings = useSettingsContext();
    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
               <CustomBreadcrumbs
                heading="Edit Yarn Contract"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Yarn Contracts',
                        href: paths.dashboard.yarnModule.yarnContract.root,
                    },
                    { name: 'Edit Yarn Contract' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <YarnContractEditForm urlData={urlData} />

        </Container>
    );
}

YarnContractEditView.propTypes = {
    urlData: PropTypes.any,
}
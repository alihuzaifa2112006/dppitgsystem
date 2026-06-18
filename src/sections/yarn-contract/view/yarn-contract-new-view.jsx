import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import YarnContractCreateForm from '../yarn-contract-new';


// ----------------------------------------------------------------------

export default function YarnContractNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Yarn Contract"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Yarn Contracts',
                        href: paths.dashboard.yarnModule.yarnContract.root,
                    },
                    { name: 'Add Yarn Contract' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <YarnContractCreateForm />
        </Container>
    );
}

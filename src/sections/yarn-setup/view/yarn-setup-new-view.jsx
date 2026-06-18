import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import YarnSetupCreateForm from '../yarn-setup-new';


// ----------------------------------------------------------------------

export default function YarnSetupNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Yarn Setup"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Yarn Setup',
                        href: paths.dashboard.yarnModule.yarnSetup.root,
                    },
                    { name: 'Add ' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <YarnSetupCreateForm />
        </Container>
    );
}

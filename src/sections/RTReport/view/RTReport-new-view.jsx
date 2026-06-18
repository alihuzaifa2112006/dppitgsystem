import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import RTReportCreateForm from '../RTReport-new';


// ----------------------------------------------------------------------

export default function RTReportNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Create  Production Report (MARGASA)"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Production Report (MARGASA)',
                        href: paths.dashboard.Production.RTReport.root,
                    },
                    { name: 'Create' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <RTReportCreateForm />
        </Container>
    );
}

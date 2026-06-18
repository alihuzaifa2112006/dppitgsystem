import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BlowReportCreateForm from '../BlowReport-new';


// ----------------------------------------------------------------------

export default function BlowReportNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Daily Production Report Blowroom"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Daily Production Report Blowroom',
                        href: paths.dashboard.Production.BlowReport.root,
                    },
                    { name: 'Create' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <BlowReportCreateForm />
        </Container>
    );
}



// Blowroom new vieee 
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import CardReportCreateForm from '../CardReport-new';


// ----------------------------------------------------------------------

export default function CardReportNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Create  Daily Production Report Carding"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Daily Production Report Carding',
                        href: paths.dashboard.Production.CardReport.root,
                    },
                    { name: 'Create' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <CardReportCreateForm />
        </Container>
    );
}

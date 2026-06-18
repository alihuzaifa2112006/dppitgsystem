import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductionReportCreateForm from '../ProductionReport-new';


// ----------------------------------------------------------------------

export default function ProductionReportNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Create Production Report"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Production Report',
                        href: paths.dashboard.Production.ProductionReport.root,
                    },
                    { name: 'Create' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductionReportCreateForm />
        </Container>
    );
}

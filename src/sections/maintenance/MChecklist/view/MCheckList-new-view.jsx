import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import MCheckListReportCreateForm from '../MCheckList-new';


// ----------------------------------------------------------------------

export default function MCheckListReportNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Create Maintenance Checklist "
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Maintenance Checklist',
                        href: paths.dashboard.Production.maintenance.MCheckList.root,
                    },
                    { name: 'Create' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <MCheckListReportCreateForm />
        </Container>
    );
}

import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ImportInvoiceEntryCreateForm from '../ImportInvoiceEntry-new';


// ----------------------------------------------------------------------

export default function ImportInvoiceEntryNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Import Invoice Entry"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Import Invoice Entry',
                        href: paths.dashboard.Commercial.import.ImportInvoiceEntry.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ImportInvoiceEntryCreateForm />
        </Container>
    );
}

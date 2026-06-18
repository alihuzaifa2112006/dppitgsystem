import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ExportInvoiceForm from '../ExportInvoice-add';

// import PiCreateForm from '../pi-new';


// ----------------------------------------------------------------------

export default function PiNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Export Invoice"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Export Invoice',
                        href: paths.dashboard.Commercial.export.ExportInvoice.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ExportInvoiceForm />
        </Container>
    );
}

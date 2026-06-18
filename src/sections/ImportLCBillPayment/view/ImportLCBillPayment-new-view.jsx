import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ImportLCBillPaymentCreateForm from '../ImportLCBillPayment-new';


// ----------------------------------------------------------------------

export default function ImportLCBillPaymentNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Import LC Bill Payment"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Import LC Bill Payment',
                        href: paths.dashboard.Commercial.import.ImportLCBillPayment.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ImportLCBillPaymentCreateForm />
        </Container>
    );
}

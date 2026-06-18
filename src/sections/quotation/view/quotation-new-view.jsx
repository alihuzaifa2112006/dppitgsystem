import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import QuotationCreateForm from '../quotation-new';


// ----------------------------------------------------------------------

export default function QuotationNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Quotation"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Quotation',
                        href: paths.dashboard.transaction.quotation.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <QuotationCreateForm />
        </Container>
    );
}

import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PriceListCreateForm from '../priceList-new';


// ----------------------------------------------------------------------

export default function PriceListNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Pricelist"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Pricelist',
                        href: paths.dashboard.transaction.priceList.root,
                    },
                    { name: 'Add Pricelist' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <PriceListCreateForm />
        </Container>
    );
}

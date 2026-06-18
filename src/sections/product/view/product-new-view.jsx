import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductCreateForm from '../product-new';


// ----------------------------------------------------------------------

export default function ProductNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Product Description"
                links={[
                    { name: 'Home', href: paths.dashboard.root },
                    { name: 'Product Description', href: paths.dashboard.productManagement.product.root },
                    { name: 'Add' },
                  ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductCreateForm />
        </Container>
    );
}

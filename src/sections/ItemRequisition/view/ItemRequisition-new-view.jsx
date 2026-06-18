import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ItemRequisitionCreateForm from '../ItemRequisition-new';


// ----------------------------------------------------------------------

export default function ItemRequisitionNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Add Item Requisition"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Item Requisition',
                        href: paths.dashboard.InventoryManagement.ItemRequisition.root,
                    },
                    { name: 'add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ItemRequisitionCreateForm />
        </Container>
    );
}

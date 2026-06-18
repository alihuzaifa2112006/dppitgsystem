import { useState } from 'react';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CostingPlanCreateForm from '../CostingPlan-new';
import { Typography, Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';




// ----------------------------------------------------------------------

export default function CostingPlanNewView() {

    const settings = useSettingsContext();

    // Upload Dialog Functions
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const handleUploadDialogOpen = () => {
        setUploadDialogOpen(true);
    };

    const handleUploadDialogClose = () => {
        setUploadDialogOpen(false);
    };

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Create Material Price"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Material Price',
                        href: paths.dashboard.AIPlans.CostingPlan.root,
                    },
                    { name: 'Add' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
                action={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:file-import-line" />}
                            color="primary"
                            onClick={handleUploadDialogOpen}
                        >
                            Bulk Upload
                        </Button>
                    </Box>
                }
            />

            {/* <Typography variant="h6" gutterBottom>Please select the Fiber Category and Fiber Sub Category to continue</Typography> */}

            <CostingPlanCreateForm />

            <UploadExcelDialog
                uploadOpen={uploadDialogOpen}
                uploadClose={handleUploadDialogClose}
            />
        </Container>
    );
}

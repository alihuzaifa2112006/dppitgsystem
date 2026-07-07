import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { Card, Typography, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function RegulationsNewView() {

    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Regulations"
                links={[
                    {
                        name: 'Home',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Regulations List',
                        href: paths.dashboard.Regulations.root,
                    },
                    { name: 'New Regulation' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <Card sx={{ p: 3 }}>
                <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                    <Iconify icon="mdi:file-document-edit-outline" width={48} sx={{ color: 'text.disabled' }} />
                    <Typography variant="body1" color="text.secondary">
                        Regulation form will be added here
                    </Typography>
                </Stack>
            </Card>
        </Container>
    );
}

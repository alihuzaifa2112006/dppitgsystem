import React from 'react';
import { Container, Card, TextField, Button, Grid, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

export default function BuyingDepartmentForm() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Buying Department"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Buying Departments List', href: paths.dashboard.Powertool.BuyingDepartment.root },
          { name: 'New Buying Department' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Field 1" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Field 2" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Field 3" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Field 4" />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary">Save</Button>
        </Stack>
      </Card>
    </Container>
  );
}

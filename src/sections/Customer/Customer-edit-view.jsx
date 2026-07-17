import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CustomerEditForm from './Customer-edit-form';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';

export default function CustomerEditView({ id }) {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(`Customer/GetById?id=${id}`);
      if (response.status === 200 && response.data?.Success) {
        setCurrentData(response.data.Data);
      } else {
        enqueueSnackbar('Customer not found', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error fetching customer', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id, fetchCustomer]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Customer"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Powertool' },
          { name: 'Customers', href: paths.dashboard.Powertool.Customer.root },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomerEditForm currentData={currentData} />
    </Container>
  );
}

CustomerEditView.propTypes = {
  id: PropTypes.string,
};

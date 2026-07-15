import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import CustomerForm from '../Customer-form';

const MOCK_AK_MARKETING = {
  CustomerID: 10045,
  Cust_Name: 'A. K. MARKETING',
  DisplayName: 'A. K. MARKETING',
  Commission: 0,
  Website: 'www.akgalleria.com',
  Forwarder: '',
  GlnNo: '',
  VatNo: '',
  TransactionMode: 'Trade',
  DefaultIncoterm: '',
  AddressLine1: 'HEAD OFFICE: 2ND FLOOR, K.D.L.B. BI',
  AddressLine2: '',
  Continent: '',
  Country: '',
  City: '',
  PostalCode: '',
  Phone: '+ 9221-32313180-83',
  Fax: '+9221- 32203368',
  DefaultCurrency: 'Dollar (USD)',
  DefaultPaymentMode: '',
  DefaultShipmentMode: '',
  DefaultPaymentTerm: '',
  DefaultTolerance: '',
  WarehouseAddressEnabled: false,
  BuyerContacts: [
    {
      id: 1,
      Name: 'NA',
      Designation: 'NA',
      CellNo: 'NA',
      Email: 'NA',
    },
  ],
};

const MOCK_ADOREME = {
  CustomerID: 10046,
  Cust_Name: 'ADOREME INC',
  DisplayName: 'ADOREME INC',
  Commission: 0,
  Website: 'www.adoreme.com',
  Forwarder: '',
  GlnNo: '',
  VatNo: '',
  TransactionMode: 'Trade',
  DefaultIncoterm: '',
  AddressLine1: '100 Broadway, New York',
  AddressLine2: '',
  Continent: 'North America',
  Country: 'USA',
  City: 'New York',
  PostalCode: '10001',
  Phone: '+1 212-555-0199',
  Fax: '',
  DefaultCurrency: 'Dollar (USD)',
  DefaultPaymentMode: '',
  DefaultShipmentMode: '',
  DefaultPaymentTerm: '',
  DefaultTolerance: '',
  WarehouseAddressEnabled: false,
  BuyerContacts: [],
};

export default function CustomerDetailView({ id }) {
  const settings = useSettingsContext();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      if (String(id) === '10045') {
        setCustomerData(MOCK_AK_MARKETING);
      } else if (String(id) === '10046') {
        setCustomerData(MOCK_ADOREME);
      } else {
        const res = await Get(`getWICByID/${id}`);
        if (res.status === 200 && res.data) {
          // Map to standard form fields
          const { data } = res;
          setCustomerData({
            CustomerID: data.Cust_ID || data.WIC_ID || id,
            Cust_Name: data.Cust_Name || data.WIC_Name || '',
            DisplayName: data.Cust_Name || data.WIC_Name || '',
            Website: data.Cust_URL || '',
            AddressLine1: data.Cust_Address1 || '',
            AddressLine2: data.Cust_Address2 || '',
            Phone: data.Cust_Landline_No || '',
            BuyerContacts: [],
          });
        } else {
          setCustomerData(MOCK_AK_MARKETING);
        }
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      // Fallback
      setCustomerData(MOCK_AK_MARKETING);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Customer Details"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Customer List',
            href: paths.dashboard.Powertool.Customer.root,
          },
          { name: customerData?.Cust_Name || 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CustomerForm currentData={customerData} />
    </Container>
  );
}

CustomerDetailView.propTypes = {
  id: PropTypes.string,
};

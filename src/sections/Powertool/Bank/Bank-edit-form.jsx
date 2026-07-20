import React, { useEffect, useState } from 'react';
import BankForm from './Bank-form';
import { useParams } from 'react-router';
import { Get } from 'src/api/apibasemethods';
import { Box, LinearProgress, Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';

export default function BankEditForm() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await Get(`Bank/GetById?id=${id}`);
        if (response.status === 200) {
          setCurrentData(response?.data?.Data || response?.data);
        }
      } catch (error) {
        console.error('Error fetching bank data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBank();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ py: 10 }}>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mb: 2, borderRadius: 1 }} />
        <Box textAlign="center" color="text.secondary">Loading Bank Details...</Box>
      </Container>
    );
  }

  return <BankForm currentData={currentData} />;
}

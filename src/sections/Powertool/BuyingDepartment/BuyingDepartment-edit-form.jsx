import React, { useEffect, useState } from 'react';
import BuyingDepartmentForm from './BuyingDepartment-form';
import { useParams } from 'react-router';
import { Get } from 'src/api/apibasemethods';
import { Box, LinearProgress, Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';

export default function BuyingDepartmentEditForm() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await Get(`BuyingDepartment/GetById?id=${id}`);
        if (response.status === 200) {
          setCurrentData(response?.data?.Data || response?.data);
        }
      } catch (error) {
        console.error('Error fetching buying department data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ py: 10 }}>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mb: 2, borderRadius: 1 }} />
        <Box textAlign="center" color="text.secondary">Loading Department Details...</Box>
      </Container>
    );
  }

  return <BuyingDepartmentForm currentData={currentData} />;
}

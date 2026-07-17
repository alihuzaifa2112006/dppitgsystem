import React from 'react';
import OfficeForm from './Office-form';
import { useParams } from 'react-router';

export default function OfficeEditForm() {
  const { id } = useParams();
  
  // Here we would typically fetch the current data by ID
  // For now, we mock it
  const dummyData = {
    OfficeName: 'Mock HQ',
    OfficeCode: 'MHQ',
    AddressLine1: '123 Fake St',
  };

  return <OfficeForm currentData={dummyData} />;
}

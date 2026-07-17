import React from 'react';
import LocationForm from './Location-form';
import { useParams } from 'react-router';

export default function LocationEditForm() {
  const { id } = useParams();
  const dummyData = { Name: 'Mock Location', Region: 'Mock Region' };
  return <LocationForm currentData={dummyData} />;
}

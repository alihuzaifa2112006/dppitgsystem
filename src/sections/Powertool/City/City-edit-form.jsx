import React from 'react';
import CityForm from './City-form';
import { useParams } from 'react-router';

export default function CityEditForm() {
  const { id } = useParams();
  const dummyData = { Name: 'Mock City' };
  return <CityForm currentData={dummyData} />;
}

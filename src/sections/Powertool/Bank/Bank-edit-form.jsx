import React from 'react';
import BankForm from './Bank-form';
import { useParams } from 'react-router';

export default function BankEditForm() {
  const { id } = useParams();
  const dummyData = { TitleOfAccount: 'Mock Title', BankName: 'Mock Bank' };
  return <BankForm currentData={dummyData} />;
}

import { Helmet } from 'react-helmet-async';
import TransactionTypeEditForm from 'src/sections/Powertool/TransactionType/TransactionType-edit-form';

export default function TransactionTypeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit TransactionType</title>
      </Helmet>
      <TransactionTypeEditForm />
    </>
  );
}
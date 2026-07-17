import { Helmet } from 'react-helmet-async';
import TransactionTypeForm from 'src/sections/Powertool/TransactionType/TransactionType-form';

export default function TransactionTypeNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new TransactionType</title>
      </Helmet>
      <TransactionTypeForm />
    </>
  );
}
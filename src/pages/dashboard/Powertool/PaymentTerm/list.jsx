import { Helmet } from 'react-helmet-async';
import PaymentTermList from 'src/sections/Powertool/PaymentTerm/PaymentTerm-list';

export default function PaymentTermListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Payment Terms List</title>
      </Helmet>
      <PaymentTermList />
    </>
  );
}
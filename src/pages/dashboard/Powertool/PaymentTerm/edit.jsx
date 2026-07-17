import { Helmet } from 'react-helmet-async';
import PaymentTermEditForm from 'src/sections/Powertool/PaymentTerm/PaymentTerm-edit-form';

export default function PaymentTermEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit PaymentTerm</title>
      </Helmet>
      <PaymentTermEditForm />
    </>
  );
}
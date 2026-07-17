import { Helmet } from 'react-helmet-async';
import PaymentTermForm from 'src/sections/Powertool/PaymentTerm/PaymentTerm-form';

export default function PaymentTermNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new PaymentTerm</title>
      </Helmet>
      <PaymentTermForm />
    </>
  );
}
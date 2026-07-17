import { Helmet } from 'react-helmet-async';
import PaymentModeForm from 'src/sections/Powertool/PaymentMode/PaymentMode-form';

export default function PaymentModeNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new PaymentMode</title>
      </Helmet>
      <PaymentModeForm />
    </>
  );
}
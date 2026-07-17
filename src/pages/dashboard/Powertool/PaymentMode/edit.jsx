import { Helmet } from 'react-helmet-async';
import PaymentModeEditForm from 'src/sections/Powertool/PaymentMode/PaymentMode-edit-form';

export default function PaymentModeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit PaymentMode</title>
      </Helmet>
      <PaymentModeEditForm />
    </>
  );
}
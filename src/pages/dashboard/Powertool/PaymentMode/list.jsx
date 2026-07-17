import { Helmet } from 'react-helmet-async';
import PaymentModeList from 'src/sections/Powertool/PaymentMode/PaymentMode-list';

export default function PaymentModeListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Payment Modes List</title>
      </Helmet>
      <PaymentModeList />
    </>
  );
}
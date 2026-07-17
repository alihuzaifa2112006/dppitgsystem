import { Helmet } from 'react-helmet-async';
import BankEditForm from 'src/sections/Powertool/Bank/Bank-edit-form';

export default function BankEditPage() {
  return (
    <>
      <Helmet><title> Dashboard: Edit Bank</title></Helmet>
      <BankEditForm />
    </>
  );
}

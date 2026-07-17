import { Helmet } from 'react-helmet-async';
import BankForm from 'src/sections/Powertool/Bank/Bank-form';

export default function BankNewPage() {
  return (
    <>
      <Helmet><title> Dashboard: Create a new Bank</title></Helmet>
      <BankForm />
    </>
  );
}

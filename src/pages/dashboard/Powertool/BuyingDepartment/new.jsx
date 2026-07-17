import { Helmet } from 'react-helmet-async';
import BuyingDepartmentForm from 'src/sections/Powertool/BuyingDepartment/BuyingDepartment-form';

export default function BuyingDepartmentNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new BuyingDepartment</title>
      </Helmet>
      <BuyingDepartmentForm />
    </>
  );
}
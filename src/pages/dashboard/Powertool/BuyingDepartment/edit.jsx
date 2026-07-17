import { Helmet } from 'react-helmet-async';
import BuyingDepartmentEditForm from 'src/sections/Powertool/BuyingDepartment/BuyingDepartment-edit-form';

export default function BuyingDepartmentEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit BuyingDepartment</title>
      </Helmet>
      <BuyingDepartmentEditForm />
    </>
  );
}
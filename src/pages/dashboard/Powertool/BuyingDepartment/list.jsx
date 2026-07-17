import { Helmet } from 'react-helmet-async';
import BuyingDepartmentList from 'src/sections/Powertool/BuyingDepartment/BuyingDepartment-list';

export default function BuyingDepartmentListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Buying Departments List</title>
      </Helmet>
      <BuyingDepartmentList />
    </>
  );
}
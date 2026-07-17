import { Helmet } from 'react-helmet-async';
import BankList from 'src/sections/Powertool/Bank/Bank-list';

export default function BankListPage() {
  return (
    <>
      <Helmet><title> Dashboard: Banks List</title></Helmet>
      <BankList />
    </>
  );
}

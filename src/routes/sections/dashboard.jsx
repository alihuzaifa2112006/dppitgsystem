import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import RoleGuard from 'src/auth/guard/RoleGuard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------

// Lazy-loaded components
const IndexPage = lazy(() => import('src/pages/dashboard/app'));

// const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

const YarnSetupListPage = lazy(() => import('src/pages/dashboard/yarn-setup/list'));
const YarnSetupNewPage = lazy(() => import('src/pages/dashboard/yarn-setup/new'));
const YarnSetupEditPage = lazy(() => import('src/pages/dashboard/yarn-setup/edit'));

const YarnContractListPage = lazy(() => import('src/pages/dashboard/yarn-contract/list'));
const YarnContractNewPage = lazy(() => import('src/pages/dashboard/yarn-contract/new'));
const YarnContractEditPage = lazy(() => import('src/pages/dashboard/yarn-contract/edit'));

const WICListPage = lazy(() => import('src/pages/dashboard/wic/list'));
const WICNewPage = lazy(() => import('src/pages/dashboard/wic/new'));
const WICEditPage = lazy(() => import('src/pages/dashboard/wic/edit'));

const WICInviteListPage = lazy(() => import('src/pages/dashboard/wic/invite/list'));
const WICInviteNewPage = lazy(() => import('src/pages/dashboard/wic/invite/new'));
const WICInviteEditPage = lazy(() => import('src/pages/dashboard/wic/invite/edit'));

const EndCustomerListPage = lazy(() => import('src/pages/dashboard/customer/end-customer/list'));
const EndCustomerEditPage = lazy(() => import('src/pages/dashboard/customer/end-customer/edit'));
const EndCustomerNewPage = lazy(() => import('src/pages/dashboard/customer/end-customer/new'));

const AssignListPage = lazy(() => import('src/pages/dashboard/assign/list'));
const AssignNewPage = lazy(() => import('src/pages/dashboard/assign/new'));
const AssignEditPage = lazy(() => import('src/pages/dashboard/assign/edit'));
const AssignApprovalPage = lazy(() => import('src/pages/dashboard/assign/approval'));

const ItemOpenListPage = lazy(() => import('src/pages/dashboard/ItemOpen/list'));
const ItemOpenNewPage = lazy(() => import('src/pages/dashboard/ItemOpen/new'));
const ItemOpenEditPage = lazy(() => import('src/pages/dashboard/ItemOpen/edit'));
const ItemOpenApprovalPage = lazy(() => import('src/pages/dashboard/ItemOpen/approval'));

const ItemOpenDatabaseListPage = lazy(() => import('src/pages/dashboard/ItemOpenDatabase/list'));
const ItemOpenDatabaseNewPage = lazy(() => import('src/pages/dashboard/ItemOpenDatabase/new'));
const ItemOpenDatabaseEditPage = lazy(() => import('src/pages/dashboard/ItemOpenDatabase/edit'));

const ProductionBucketListPage = lazy(
  () => import('src/pages/dashboard/ProductionBucket/list')
);
const ProductionBucketNewPage = lazy(
  () => import('src/pages/dashboard/ProductionBucket/new')
);
const ProductionBucketEditPage = lazy(
  () => import('src/pages/dashboard/ProductionBucket/edit')
);
const ProductionMiddlewareListPage = lazy(
  () => import('src/pages/dashboard/ProductionMiddleware/list')
);
const ProductionMiddlewareNewPage = lazy(
  () => import('src/pages/dashboard/ProductionMiddleware/new')
);
const ProductionMiddlewareEditPage = lazy(
  () => import('src/pages/dashboard/ProductionMiddleware/edit')
);

const VendorListPage = lazy(() => import('src/pages/dashboard/admin/vendor/list'));
const VendorNewPage = lazy(() => import('src/pages/dashboard/admin/vendor/new'));
const VendorEditPage = lazy(() => import('src/pages/dashboard/admin/vendor/edit'));

const CustomerListPage = lazy(() => import('src/pages/dashboard/customer/list'));
const CustomerNewPage = lazy(() => import('src/pages/dashboard/customer/new'));

const ProfileListPage = lazy(() => import('src/pages/dashboard/profile/list'));
const ProfileEditPage = lazy(() => import('src/pages/dashboard/profile/edit'));
const ProfileNewPage = lazy(() => import('src/pages/dashboard/profile/new'));

// Product Management---------
const YarnTypePage = lazy(() => import('src/pages/dashboard/product-management/yarn-type/view'));

const ColorListPage = lazy(() => import('src/pages/dashboard/product-management/color/list'));
const ColorNewPage = lazy(() => import('src/pages/dashboard/product-management/color/new'));
const ColorEditPage = lazy(() => import('src/pages/dashboard/product-management/color/edit'));

const ItemIssueListPage = lazy(() => import('src/pages/dashboard/ItemIssue/list'));
const ItemIssuePDFPage = lazy(() => import('src/pages/dashboard/ItemIssue/pdf'));

const ItemReturnAcknowledgementListPage = lazy(
  () => import('src/pages/dashboard/ItemReturnAcknowledgement/list')
);
const ItemReturnAcknowledgementPDFPage = lazy(
  () => import('src/pages/dashboard/ItemReturnAcknowledgement/pdf')
);

const ClaimAssignment = lazy(() => import('src/pages/dashboard/claim-assignment/view'));
const ClaimFormPage = lazy(() => import('src/pages/dashboard/claim-assignment/claim-form'));
const ClaimReport = lazy(() => import('src/pages/dashboard/claim-assignment/pdf'));
const ClaimAuditsListPage = lazy(() => import('src/pages/dashboard/claim-audits/list'));
const ClaimSettlementPage = lazy(() => import('src/pages/dashboard/claim-audits/settlement'));

const ExportListPage = lazy(() => import('src/pages/dashboard/Export/list'));
const ExportViewPage = lazy(() => import('src/pages/dashboard/Export/view'));
const ExportNewPage = lazy(() => import('src/pages/dashboard/Export/new'));
const ExportEditPage = lazy(() => import('src/pages/dashboard/Export/edit'));
const ExportPDFPage = lazy(() => import('src/pages/dashboard/Export/pdf'));
const ExportAmendmentPage = lazy(() => import('src/pages/dashboard/Export/amendment'));

const CompositionListPage = lazy(
  () => import('src/pages/dashboard/product-management/composition/list')
);
const CompositionNewPage = lazy(
  () => import('src/pages/dashboard/product-management/composition/new')
);
const CompositionEditPage = lazy(
  () => import('src/pages/dashboard/product-management/composition/edit')
);

const YarnCountListPage = lazy(
  () => import('src/pages/dashboard/product-management/yarn-count/list')
);
const YarnCountNewPage = lazy(
  () => import('src/pages/dashboard/product-management/yarn-count/new')
);
const YarnCountEditPage = lazy(
  () => import('src/pages/dashboard/product-management/yarn-count/edit')
);

const DepartmentListPage = lazy(() => import('src/pages/dashboard/admin/department/view'));
const CountryListPage = lazy(() => import('src/pages/dashboard/admin/country/view'));
const FabricListPage = lazy(() => import('src/pages/dashboard/admin/fabric/view'));
const CityListPage = lazy(() => import('src/pages/dashboard/admin/city/view'));
const StaffListPage = lazy(() => import('src/pages/dashboard/admin/staff/view'));
const FormListPage = lazy(() => import('src/pages/dashboard/admin/form/view'));
const UomListPage = lazy(() => import('src/pages/dashboard/admin/uom/view'));
const RoleListPage = lazy(() => import('src/pages/dashboard/admin/role/view'));
const DepsectionListPage = lazy(() => import('src/pages/dashboard/admin/depsection/view'));
const FormRoleListPage = lazy(() => import('src/pages/dashboard/admin/formRole/view'));
const ClauseListPage = lazy(() => import('src/pages/dashboard/admin/clause/view'));
const BlendnameListPage = lazy(() => import('src/pages/dashboard/admin/blendname/view'));

const ApprovalListPage = lazy(() => import('src/pages/dashboard/admin/approval/list'));
const ApprovalSignaturePage = lazy(() => import('src/pages/dashboard/admin/approval/signature'));
const ApprovalNewPage = lazy(() => import('src/pages/dashboard/admin/approval/new'));
const ApprovalEditPage = lazy(() => import('src/pages/dashboard/admin/approval/edit'));

const UserProfilePage = lazy(() => import('src/pages/dashboard/admin/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/admin/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/admin/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/admin/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/admin/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/admin/user/edit'));

const LocationListPage = lazy(() => import('src/pages/dashboard/admin/location/view'));
const RoomListPage = lazy(() => import('src/pages/dashboard/admin/room/view'));

const FormsListPage = lazy(() => import('src/pages/dashboard/admin/forms/view'));
const FormEditPage = lazy(() => import('src/pages/dashboard/admin/forms/edit'));
const FormNewPage = lazy(() => import('src/pages/dashboard/admin/forms/new'));
const FormNewPageMst = lazy(() => import('src/pages/dashboard/admin/forms/form'));

const PurposeListPage = lazy(() => import('src/pages/dashboard/admin/purpose/view'));
const SpecificationListPage = lazy(() => import('src/pages/dashboard/admin/specification/view'));
const SparePartsListPage = lazy(() => import('src/pages/dashboard/admin/spareparts/view'));

const BudgetListPage = lazy(() => import('src/pages/dashboard/admin/budget/view'));

const InvTypeSetupListPage = lazy(() => import('src/pages/dashboard/admin/InvType/view'));
const CategoryListPage = lazy(() => import('src/pages/dashboard/admin/inv-category/view'));
const InvTypeListPage = lazy(() => import('src/pages/dashboard/admin/subcategory/view'));
const ReqMiddlewareListPage = lazy(() => import('src/pages/dashboard/admin/ReqMiddleware/view'));
const ChargeTypeListPage = lazy(() => import('src/pages/dashboard/admin/ChargeType/view'));
const OriginFactorListPage = lazy(() => import('src/pages/dashboard/admin/OriginFactor/view'));
const QualityFactorListPage = lazy(() => import('src/pages/dashboard/admin/QualityFactor/view'));

const ProductListPage = lazy(() => import('src/pages/dashboard/product-management/product/list'));
const ProductNewPage = lazy(() => import('src/pages/dashboard/product-management/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product-management/product/edit'));

const ProductionListPage = lazy(
  () => import('src/pages/dashboard/product-management/production/list')
);
const ProductionEditPage = lazy(
  () => import('src/pages/dashboard/product-management/production/edit')
);
const ProductionNewPage = lazy(
  () => import('src/pages/dashboard/product-management/production/new')
);

// ---------------------------

const OpportunityListPage = lazy(() => import('src/pages/dashboard/opportunity/list'));
const OpportunityNewPage = lazy(() => import('src/pages/dashboard/opportunity/new'));
const OpportunityEditPage = lazy(() => import('src/pages/dashboard/opportunity/edit'));
const OpportunityApprovalPage = lazy(() => import('src/pages/dashboard/opportunity/approval'));

const DispoderListPage = lazy(() => import('src/pages/dashboard/dispoder/list'));
const DispoderNewPage = lazy(() => import('src/pages/dashboard/dispoder/new'));
const DispoderEditPage = lazy(() => import('src/pages/dashboard/dispoder/edit'));
const DispoderApprovalPage = lazy(() => import('src/pages/dashboard/dispoder/approval'));

const QuotationListPage = lazy(() => import('src/pages/dashboard/quotation/list'));
const QuotationNewPage = lazy(() => import('src/pages/dashboard/quotation/new'));
const QuotationEditPage = lazy(() => import('src/pages/dashboard/quotation/edit'));
const QuotationApprovalPage = lazy(() => import('src/pages/dashboard/quotation/approval'));
const QuotationPDFPage = lazy(() => import('src/pages/dashboard/quotation/pdf'));

const PrListPage = lazy(() => import('src/pages/dashboard/pr/list'));
const PrNewPage = lazy(() => import('src/pages/dashboard/pr/new'));
const PrEditPage = lazy(() => import('src/pages/dashboard/pr/edit'));
const PrApprovalPage = lazy(() => import('src/pages/dashboard/pr/approval'));
const PrPDFPage = lazy(() => import('src/pages/dashboard/pr/pdf'));

const PoListPage = lazy(() => import('src/pages/dashboard/po/list'));
const PoNewPage = lazy(() => import('src/pages/dashboard/po/new'));
const PoEditPage = lazy(() => import('src/pages/dashboard/po/edit'));
const PoApprovalPage = lazy(() => import('src/pages/dashboard/po/approval'));
const PoPDFPage = lazy(() => import('src/pages/dashboard/po/pdf'));

const PIEmailPage = lazy(() => import('src/pages/dashboard/emailHistory/pi/list'));

const SampleListPage = lazy(() => import('src/pages/dashboard/sample/list'));
const SampleNewPage = lazy(() => import('src/pages/dashboard/sample/new'));
const SampleEditPage = lazy(() => import('src/pages/dashboard/sample/edit'));
const SamplePDFPage = lazy(() => import('src/pages/dashboard/sample/pdf'));

const PiListPage = lazy(() => import('src/pages/dashboard/pi/list'));
const PiNewPage = lazy(() => import('src/pages/dashboard/pi/new'));
const PiEditPage = lazy(() => import('src/pages/dashboard/pi/edit'));
const PiRevisionPage = lazy(() => import('src/pages/dashboard/pi/revision'));
const PiApprovalPage = lazy(() => import('src/pages/dashboard/pi/approval'));
const PiPDFPage = lazy(() => import('src/pages/dashboard/pi/pdf'));
// ---------------------------
const ItemQCListPage = lazy(() => import('src/pages/dashboard/QC/item/list'));

const PriceListPage = lazy(() => import('src/pages/dashboard/priceList/list'));
const PriceListNewPage = lazy(() => import('src/pages/dashboard/priceList/new'));
const PriceListEditPage = lazy(() => import('src/pages/dashboard/priceList/edit'));
const PriceListNewVersionPage = lazy(() => import('src/pages/dashboard/priceList/new-version'));

const EndCustomer = lazy(() => import('src/pages/dashboard/customer/end-customer/view'));
const Agent = lazy(() => import('src/pages/dashboard/customer/agent/view'));
const AgencyListPage = lazy(() => import('src/pages/dashboard/customer/agency/list'));
const AgencyEditPage = lazy(() => import('src/pages/dashboard/customer/agency/edit'));
const AgencyNewPage = lazy(() => import('src/pages/dashboard/customer/agency/new'));
const CoversheetList = lazy(() => import('src/pages/dashboard/customer/coversheet/list'));
const CoverSheetView = lazy(() => import('src/pages/dashboard/customer/coversheet/view'));
const ComplianceStatusListPage = lazy(
  () => import('src/pages/dashboard/customer/complianceStatus/list')
);

const RawMaterialListPage = lazy(
  () => import('src/pages/dashboard/Inventory-management/Raw-Material/list')
);
const RawMaterialNewPage = lazy(
  () => import('src/pages/dashboard/Inventory-management/Raw-Material/new')
);
const RawMaterialEditPage = lazy(
  () => import('src/pages/dashboard/Inventory-management/Raw-Material/edit')
);

const MachineListPage = lazy(() => import('src/pages/dashboard/admin/Machine/view'));

const RMListPage = lazy(() => import('src/pages/dashboard/Inventory-management/Raw_Material/list'));
const RMNewPage = lazy(() => import('src/pages/dashboard/Inventory-management/Raw_Material/new'));
const RMEditPage = lazy(() => import('src/pages/dashboard/Inventory-management/Raw_Material/edit'));

const ItemRecieveListPage = lazy(() => import('src/pages/dashboard/ItemRecieve/list'));
const ItemRecieveNewPage = lazy(() => import('src/pages/dashboard/ItemRecieve/new'));
const ItemRecieveEditPage = lazy(() => import('src/pages/dashboard/ItemRecieve/edit'));
const ItemRecieveApprovalPage = lazy(() => import('src/pages/dashboard/ItemRecieve/approval'));
const ItemRecievePDFPage = lazy(() => import('src/pages/dashboard/ItemRecieve/pdf'));

const ItemRequisitionListPage = lazy(() => import('src/pages/dashboard/ItemRequisition/list'));
const ItemRequisitionNewPage = lazy(() => import('src/pages/dashboard/ItemRequisition/new'));
const ItemRequisitionEditPage = lazy(() => import('src/pages/dashboard/ItemRequisition/edit'));
const ItemRequisitionApprovalPage = lazy(
  () => import('src/pages/dashboard/ItemRequisition/approval')
);

const SupplierProfileListPage = lazy(
  () => import('src/pages/dashboard/admin/supplier-profile/list')
);
const SupplierProfileEditPage = lazy(
  () => import('src/pages/dashboard/admin/supplier-profile/edit')
);
const SupplierProfileNewPage = lazy(() => import('src/pages/dashboard/admin/supplier-profile/new'));

const WasteVoucherListPage = lazy(() => import('src/pages/dashboard/WasteVoucher/list'));
const WasteVoucherNewPage = lazy(() => import('src/pages/dashboard/WasteVoucher/new'));
const WasteVoucherEditPage = lazy(() => import('src/pages/dashboard/WasteVoucher/edit'));
const ItemVoucherPDFPage = lazy(() => import('src/pages/dashboard/WasteVoucher/pdf'));

const TransferVoucherListPage = lazy(() => import('src/pages/dashboard/TransferVoucher/list'));
const TransferVoucherNewPage = lazy(() => import('src/pages/dashboard/TransferVoucher/new'));
const TransferVoucherEditPage = lazy(() => import('src/pages/dashboard/TransferVoucher/edit'));
const TransferVoucherPDFPage = lazy(() => import('src/pages/dashboard/TransferVoucher/pdf'));

const RecipeListPage = lazy(() => import('src/pages/dashboard/recipe/list'));
const RecipeNewPage = lazy(() => import('src/pages/dashboard/recipe/new'));
const RecipeEditPage = lazy(() => import('src/pages/dashboard/recipe/edit'));

const ProductRequestListPage = lazy(() => import('src/pages/dashboard/ProductRequest/list'));
const ProductRequestNewPage = lazy(() => import('src/pages/dashboard/ProductRequest/new'));
const ProductRequestEditPage = lazy(() => import('src/pages/dashboard/ProductRequest/edit'));
const ProductRequestPDFPage = lazy(() => import('src/pages/dashboard/ProductRequest/pdf'));

const ProductVoucherListPage = lazy(() => import('src/pages/dashboard/ProductVoucher/list'));
const ProductVoucherNewPage = lazy(() => import('src/pages/dashboard/ProductVoucher/new'));

const TransferPIVoucherListPage = lazy(() => import('src/pages/dashboard/TransferPIVoucher/list'));
const TransferPIVoucherNewPage = lazy(() => import('src/pages/dashboard/TransferPIVoucher/new'));

const GoodsRecievedConfirmationListPage = lazy(
  () => import('src/pages/dashboard/GoodsRecievedConfirmation/list')
);
const GoodsRecievedConfirmationNewPage = lazy(
  () => import('src/pages/dashboard/GoodsRecievedConfirmation/new')
);
const GoodsRecievedConfirmationPDFPage = lazy(
  () => import('src/pages/dashboard/GoodsRecievedConfirmation/pdf')
);
const GoodsRecievedConfirmationEditPage = lazy(
  () => import('src/pages/dashboard/GoodsRecievedConfirmation/edit')
);

const ProductionReportListPage = lazy(() => import('src/pages/dashboard/ProductionReport/list'));
const ProductionReportNewPage = lazy(() => import('src/pages/dashboard/ProductionReport/new'));
const ProductionPDFPage = lazy(() => import('src/pages/dashboard/ProductionReport/pdf'));
const ProductionReportEditPage = lazy(() => import('src/pages/dashboard/ProductionReport/edit'));

const OpeningBankListPage = lazy(() => import('src/pages/dashboard/admin/OpeningBank/view'));

const CardReportListPage = lazy(() => import('src/pages/dashboard/CardReport/list'));
const CardReportNewPage = lazy(() => import('src/pages/dashboard/CardReport/new'));
const CardReportPDFPage = lazy(() => import('src/pages/dashboard/CardReport/pdf'));
const CardReportEditPage = lazy(() => import('src/pages/dashboard/CardReport/edit'));


const DrawReportListPage = lazy(() => import('src/pages/dashboard/DrawReport/list'));
const DrawReportNewPage = lazy(() => import('src/pages/dashboard/DrawReport/new'));
const DrawReportPDFPage = lazy(() => import('src/pages/dashboard/DrawReport/pdf'));

const RTReportListPage = lazy(() => import('src/pages/dashboard/RTReport/list'));
const RTReportNewPage = lazy(() => import('src/pages/dashboard/RTReport/new'));
const RTReportPDFPage = lazy(() => import('src/pages/dashboard/RTReport/pdf'));

const BlowReportListPage = lazy(() => import('src/pages/dashboard/BlowReport/list'));
const BlowReportNewPage = lazy(() => import('src/pages/dashboard/BlowReport/new'));
const BlowReportPDFPage = lazy(() => import('src/pages/dashboard/BlowReport/pdf'));
const BlowReportEditPage = lazy(() => import('src/pages/dashboard/BlowReport/edit'));

const CommercialListPage = lazy(() => import('src/pages/dashboard/commercial/list'));
const CommercialNewPage = lazy(() => import('src/pages/dashboard/commercial/new'));
const CommercialEditPage = lazy(() => import('src/pages/dashboard/commercial/edit'));
const CommercialPDFPage = lazy(() => import('src/pages/dashboard/commercial/pdf'));

const DocSubmitListPage = lazy(() => import('src/pages/dashboard/documentsubmission/list'));
const DocSubmitNewPage = lazy(() => import('src/pages/dashboard/documentsubmission/new'));
const DocSubmitEditPage = lazy(() => import('src/pages/dashboard/documentsubmission/edit'));
const DocSubmitPDFPage = lazy(() => import('src/pages/dashboard/documentsubmission/pdf'));

const DocRealizationListPage = lazy(() => import('src/pages/dashboard/docRealization/list'));
const DocRealizationNewPage = lazy(() => import('src/pages/dashboard/docRealization/new'));
const DocRealizationEditPage = lazy(() => import('src/pages/dashboard/docRealization/edit'));

const ImportPIRegisterListPage = lazy(() => import('src/pages/dashboard/ImportPIRegister/list'));
const ImportPIRegisterNewPage = lazy(() => import('src/pages/dashboard/ImportPIRegister/new'));
const ImportPIRegisterEditPage = lazy(() => import('src/pages/dashboard/ImportPIRegister/edit'));

const ImportLCInfoListPage = lazy(() => import('src/pages/dashboard/Import_LC_Info/list'));
const ImportLCInfoNewPage = lazy(() => import('src/pages/dashboard/Import_LC_Info/new'));
const ImportLCInfoEditPage = lazy(() => import('src/pages/dashboard/Import_LC_Info/edit'));

const ImportInvoiceEntryListPage = lazy(
  () => import('src/pages/dashboard/ImportInvoiceEntry/list')
);
const ImportInvoiceEntryNewPage = lazy(() => import('src/pages/dashboard/ImportInvoiceEntry/new'));
const ImportInvoiceEntryEditPage = lazy(
  () => import('src/pages/dashboard/ImportInvoiceEntry/edit')
);

const ImportLCBillPaymentListPage = lazy(
  () => import('src/pages/dashboard/ImportLCBillPayment/list')
);
const ImportLCBillPaymentNewPage = lazy(
  () => import('src/pages/dashboard/ImportLCBillPayment/new')
);
const ImportLCBillPaymentEditPage = lazy(
  () => import('src/pages/dashboard/ImportLCBillPayment/edit')
);

const AIPlaningPage = lazy(() => import('src/pages/dashboard/AI/create'));
const CostingPlanListPage = lazy(() => import('src/pages/dashboard/CostingPlan/list'));
const CostingPlanNewPage = lazy(() => import('src/pages/dashboard/CostingPlan/new'));
const CostingPlanPDFPage = lazy(() => import('src/pages/dashboard/CostingPlan/pdf'));
const CostingPlanEditPage = lazy(() => import('src/pages/dashboard/CostingPlan/edit'));

// HR Module
const HRUserCardsPage = lazy(() => import('src/pages/dashboard/HR_Module/user/cards'));
const HRUserListPage = lazy(() => import('src/pages/dashboard/HR_Module/user/list'));
const HRUserAccountPage = lazy(() => import('src/pages/dashboard/HR_Module/user/account'));
const HRUserCreatePage = lazy(() => import('src/pages/dashboard/HR_Module/user/new'));
const HRUserEditPage = lazy(() => import('src/pages/dashboard/HR_Module/user/edit'));
const HRUserPolicyPage = lazy(() => import('src/pages/dashboard/HR_Module/user/policy'));
const HolidayListPage = lazy(() => import('src/pages/dashboard/HR_Module/holidays/view'));
const SectionListPage = lazy(() => import('src/pages/dashboard/HR_Module/section/view'));
const DesignationListPage = lazy(() => import('src/pages/dashboard/HR_Module/designation/view'));
const HRDepartmentListPage = lazy(() => import('src/pages/dashboard/HR_Module/department/view'));

const SalarySetupListPage = lazy(() => import('src/pages/dashboard/HR_Module/salarysetup/list'));
const SalarySetupNewPage = lazy(() => import('src/pages/dashboard/HR_Module/salarysetup/new'));
const SalarySetupEditPage = lazy(() => import('src/pages/dashboard/HR_Module/salarysetup/edit'));

const EmployeeDismissalListPage = lazy(
  () => import('src/pages/dashboard/HR_Module/employee-dismissal/view')
);
const EmployeeDismissalNewPage = lazy(
  () => import('src/pages/dashboard/HR_Module/employee-dismissal/new')
);
const EmployeeDismissalEditPage = lazy(
  () => import('src/pages/dashboard/HR_Module/employee-dismissal/edit')
);

const HRShiftRosterListPage = lazy(() => import('src/pages/dashboard/HR_Module/ShiftRoster/view'));
// reports
const StockReportPage = lazy(() => import('src/pages/dashboard/reports/stockReport'));
const ColorWiseStockReportPage = lazy(
  () => import('src/pages/dashboard/reports/ColorWiseStockReport')
);
const PSFIssueReportPage = lazy(() => import('src/pages/dashboard/reports/PSFIssueReport'));

const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));

// Maintenance
const MaintenanceScheduleListPage = lazy(
  () => import('src/pages/dashboard/maintenance/schedule/list')
);
const MaintenanceScheduleNewPage = lazy(
  () => import('src/pages/dashboard/maintenance/schedule/new')
);
const MCheckListPage = lazy(() => import('src/pages/dashboard/maintenance/MCheckList/list'));
const MCheckListNewPage = lazy(() => import('src/pages/dashboard/maintenance/MCheckList/new'));

const MCheckListPDF = lazy(() => import('src/pages/dashboard/maintenance/MCheckList/pdf'));
// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'app',
    element: (
      <AuthGuard>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DashboardLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </LocalizationProvider>
      </AuthGuard>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <IndexPage />
          </Suspense>
        ),
        index: true,
      },
      { path: 'calendar', element: <CalendarPage /> },
      // ai
      {
        path: 'AIPlans',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AIPlaningPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'CostingPlan',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CostingPlanListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CostingPlanNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:Voucher_ID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CostingPlanPDFPage />
                  </Suspense>
                ),
              },
              // CostingPlanEditPage
              {
                path: 'edit/:CostingPlanID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CostingPlanEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // user
      // {
      //   path: 'user',
      //   children: [
      //     {
      //       element: (
      //         <Suspense fallback={<LoadingScreen />}>
      //           <UserAccountPage />
      //         </Suspense>
      //       ),
      //       index: true,
      //     },
      //     {
      //       path: 'account',
      //       element: (
      //         <Suspense fallback={<LoadingScreen />}>
      //           <UserAccountPage />
      //         </Suspense>
      //       ),
      //     },
      //   ],
      // },
      // admin
      {
        path: 'admin',
        element: (
          <RoleGuard allowedRoles={[70, 80, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          // {
          //   path: 'department',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <DepartmentListPage />
          //     </Suspense>
          //   ),
          // },
          // {
          //   path: 'staff',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <StaffListPage />
          //     </Suspense>
          //   ),
          // },
          // {
          //   path: 'role',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <RoleListPage />
          //     </Suspense>
          //   ),
          // },
          // {
          //   path: 'section',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <DepsectionListPage />
          //     </Suspense>
          //   ),
          // },
          // {
          //   path: 'formRole',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <FormRoleListPage />
          //     </Suspense>
          //   ),
          // },
          // {
          //   path: 'form',
          //   element: (
          //     <Suspense fallback={<LoadingScreen />}>
          //       <FormListPage />
          //     </Suspense>
          //   ),
          // },
          {
            path: 'vendor',
            element: (
              <RoleGuard
                allowedRoles={[63, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 66, 70]}
              >
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <VendorListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <VendorNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:vendorID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <VendorEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'user',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserCreatePage />
                  </Suspense>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'profile',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserProfilePage />
                  </Suspense>
                ),
              },
              {
                path: 'cards',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserCardsPage />
                  </Suspense>
                ),
              },
              {
                path: 'account',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UserAccountPage />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: 'doc-approval',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ApprovalListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'signature',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ApprovalSignaturePage />
                  </Suspense>
                ),
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ApprovalNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ApprovalEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'location',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <LocationListPage />
              </Suspense>
            ),
          },
          {
            path: 'room',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <RoomListPage />
              </Suspense>
            ),
          },

          {
            path: 'inventoryType',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InvTypeListPage />
              </Suspense>
            ),
          },
          {
            path: 'reqMiddleware',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ReqMiddlewareListPage />
              </Suspense>
            ),
          },
          {
            path: 'ChargeType',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ChargeTypeListPage />
              </Suspense>
            ),
          },

          {
            path: 'supplier-profile',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SupplierProfileListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SupplierProfileNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:supplierProfileID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SupplierProfileEditPage />
                  </Suspense>
                ),
              },
            ],
          },

          // forms
          {
            path: 'forms',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormsListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'form',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormNewPageMst />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:FormID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // reports

      {
        path: 'reports',
        element: (
          <RoleGuard allowedRoles={[87, 88, 70, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'stockReport',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StockReportPage />
              </Suspense>
            ),
          },
          {
            path: 'ColorWiseStockReport',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ColorWiseStockReportPage />
              </Suspense>
            ),
          },
          {
            path: 'PSFIssueReport',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PSFIssueReportPage />
              </Suspense>
            ),
          },
        ],
      },

      // HR Module
      {
        path: 'HR_Module',
        element: (
          <RoleGuard allowedRoles={[1, 2, 3, 4]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'user',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserCreatePage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'policy/:id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserPolicyPage />
                  </Suspense>
                ),
              },

              {
                path: ':id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserCardsPage />
                  </Suspense>
                ),
              },
              {
                path: 'account',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRUserAccountPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'setup/section',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SectionListPage />
              </Suspense>
            ),
          },
          {
            path: 'setup/department',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <HRDepartmentListPage />
              </Suspense>
            ),
          },
          {
            path: 'setup/designation',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <DesignationListPage />
              </Suspense>
            ),
          },
          {
            path: 'setup/holidays',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <HolidayListPage />
              </Suspense>
            ),
          },

          {
            path: 'setup/EmployeeDismissal',
            children: [
              {
                path: 'view',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EmployeeDismissalListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EmployeeDismissalNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EmployeeDismissalEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'Salary/setup',
            children: [
              {
                path: 'list',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SalarySetupListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SalarySetupNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SalarySetupEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'Policy',
            children: [
              {
                path: 'ShiftRoster',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <HRShiftRosterListPage />
                  </Suspense>
                ),
                index: true,
              },
            ],
          },
        ],
      },

      // powertools
      {
        path: 'powertools',
        element: (
          <RoleGuard allowedRoles={[70, 80, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          // administrative
          {
            path: 'administrative',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                path: 'department',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DepartmentListPage />
                  </Suspense>
                ),
              },
              {
                path: 'staff',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <StaffListPage />
                  </Suspense>
                ),
              },
              {
                path: 'role',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RoleListPage />
                  </Suspense>
                ),
              },
              {
                path: 'section',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DepsectionListPage />
                  </Suspense>
                ),
              },
              {
                path: 'formRole',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormRoleListPage />
                  </Suspense>
                ),
              },
              {
                path: 'form',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FormListPage />
                  </Suspense>
                ),
              },
              {
                path: 'uom',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <UomListPage />
                  </Suspense>
                ),
              },
            ],
          },

          // crm
          {
            path: 'crm',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                path: 'country',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CountryListPage />
                  </Suspense>
                ),
              },
              {
                path: 'fabric',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <FabricListPage />
                  </Suspense>
                ),
              },
              {
                path: 'city',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CityListPage />
                  </Suspense>
                ),
              },

              {
                path: 'blendname',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BlendnameListPage />
                  </Suspense>
                ),
              },
              {
                path: 'clause',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClauseListPage />
                  </Suspense>
                ),
              },
            ],
          },

          // inventory
          {
            path: 'inventory',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                path: 'location',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <LocationListPage />
                  </Suspense>
                ),
              },
              {
                path: 'room',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RoomListPage />
                  </Suspense>
                ),
              },
              {
                path: 'InvType',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <InvTypeSetupListPage />
                  </Suspense>
                ),
              },
              {
                path: 'inventoryType',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <InvTypeListPage />
                  </Suspense>
                ),
              },
              {
                path: 'reqMiddleware',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ReqMiddlewareListPage />
                  </Suspense>
                ),
              },
              {
                path: 'ChargeType',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ChargeTypeListPage />
                  </Suspense>
                ),
              },

              {
                path: 'OriginFactor',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OriginFactorListPage />
                  </Suspense>
                ),
              },

              {
                path: 'QualityFactor',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QualityFactorListPage />
                  </Suspense>
                ),
              },
              {
                path: 'inv-category',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CategoryListPage />
                  </Suspense>
                ),
              },
              {
                path: 'subcategory',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <InvTypeListPage />
                  </Suspense>
                ),
              },
              {
                path: 'purpose',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PurposeListPage />
                  </Suspense>
                ),
              },
              {
                path: 'specification',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SpecificationListPage />
                  </Suspense>
                ),
              },
              {
                path: 'spareparts',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SparePartsListPage />
                  </Suspense>
                ),
              },
              {
                path: 'budget',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BudgetListPage />
                  </Suspense>
                ),
              },
              {
                path: 'Machine',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <MachineListPage />
                  </Suspense>
                ),
              },
            ],
          },

          // Commercial
          {
            path: 'commercial',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                path: 'OpeningBank',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OpeningBankListPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // email
      {
        path: 'email-history',
        element: (
          <RoleGuard allowedRoles={[70, 80]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'pi',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PIEmailPage />
              </Suspense>
            ),
          },
        ],
      },
      // yarn
      {
        path: 'yarn-module',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <YarnSetupListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'yarn-setup',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnSetupListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnSetupNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:yarnSetupID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnSetupEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'yarn-contract',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnContractListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnContractNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:yarnContractID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnContractEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      // customer
      {
        path: 'customer',
        element: (
          <RoleGuard allowedRoles={[70, 80]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerNewPage />
              </Suspense>
            ),
          },
          // end customer
          {
            path: 'end-customer',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EndCustomerListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EndCustomerNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ECID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <EndCustomerEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          // agent
          {
            path: 'agent',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <Agent />
                  </Suspense>
                ),
                index: true,
              },
            ],
          },
          {
            path: 'agency',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AgencyListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AgencyNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:AgencyID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AgencyEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          // wic
          // {
          //   path: 'wic',
          //   element: (
          //     <RoleGuard allowedRoles={[70, 80]}>
          //       <Outlet />
          //     </RoleGuard>
          //   ),
          //   children: [
          //     {
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICListPage />
          //         </Suspense>
          //       ),
          //       index: true,
          //     },
          //     {
          //       path: 'new',
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICNewPage />
          //         </Suspense>
          //       ),
          //     },
          //     {
          //       path: 'edit/:wicID/',
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICEditPage />
          //         </Suspense>
          //       ),
          //     },
          //   ],
          // },
          // {
          //   path: 'invite',
          //   element: (
          //     <RoleGuard allowedRoles={[70, 80]}>
          //       <Outlet />
          //     </RoleGuard>
          //   ),
          //   children: [
          //     {
          //       index: true,
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICInviteListPage />
          //         </Suspense>
          //       ),
          //     },
          //     {
          //       path: 'new',
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICInviteNewPage />
          //         </Suspense>
          //       ),
          //     },
          //     {
          //       path: 'edit/:wicInviteID/',
          //       element: (
          //         <Suspense fallback={<LoadingScreen />}>
          //           <WICInviteEditPage />
          //         </Suspense>
          //       ),
          //     },
          //   ],
          // },

          // profile
          {
            path: 'profile',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfileListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfileNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:profileID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfileEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          // coversheet
          {
            path: 'coversheet',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CoversheetList />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'view/:coversheetID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CoverSheetView />
                  </Suspense>
                ),
              },
            ],
          },
          // compliace sheet
          {
            path: 'compliance-status',
            element: (
              <RoleGuard allowedRoles={[70, 80]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ComplianceStatusListPage />
                  </Suspense>
                ),
                index: true,
              },
            ],
          },
        ],
      },

      // product management
      {
        path: 'product-management',
        element: (
          <RoleGuard allowedRoles={[70, 80, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'yarn-type',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <YarnTypePage />
              </Suspense>
            ),
          },
          {
            path: 'color-database',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ColorListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ColorNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:colorID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ColorEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'composition',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CompositionListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CompositionNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:compositionID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CompositionEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'yarn-count',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnCountListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnCountNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:yarnCountID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <YarnCountEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'product',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:productID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // transaction
      {
        path: 'transaction',
        element: (
          <RoleGuard allowedRoles={[70, 80, 85, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          // opportunity
          {
            path: 'opportunity',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OpportunityListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OpportunityNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:opportunityID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OpportunityEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:opportunityID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <OpportunityApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },

          // pricelist
          {
            path: 'price-list',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PriceListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PriceListNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:pricelistID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PriceListEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'new-version/:pricelistID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PriceListNewVersionPage />
                  </Suspense>
                ),
              },
            ],
          },

          // quotation
          {
            path: 'quotation',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QuotationListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QuotationNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:quotationID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QuotationEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:quotationID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QuotationApprovalPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:quotationID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <QuotationPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          // sample
          {
            path: 'sample',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SampleListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SampleNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:sampleID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SampleEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:sampleID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <SamplePDFPage />
                  </Suspense>
                ),
              },
            ],
          },

          // pi
          {
            path: 'pi',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'revision/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiRevisionPage />
                  </Suspense>
                ),
              },
              {
                path: 'approver/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiApprovalPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PiPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          // dispoder
          {
            path: 'dispoder',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:dispoderID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:dispoderID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // QC
      {
        path: 'qc',
        element: (
          <RoleGuard allowedRoles={[70, 89, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'item',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ItemQCListPage />
              </Suspense>
            ),
          },
        ],
      },

      // customer claim
      {
        path: 'customer-claim',
        element: (
          <RoleGuard allowedRoles={[70, 80, 85, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'claim-form',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ClaimFormPage />
              </Suspense>
            ),
          },

          {
            path: 'dispoder',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:dispoderID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:dispoderID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DispoderApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'monitor',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimAssignment />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'pdf/:piID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimReport />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'claim',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimAuditsListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimAuditsListPage />
                  </Suspense>
                ),
              },
              {
                path: 'settlement/:CusTomerID/:AuditID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimSettlementPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:piID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ClaimReport />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // inventory
      {
        path: 'inventory-management',
        element: (
          <RoleGuard allowedRoles={[87, 88, 70, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          // raw
          {
            path: 'raw',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RawMaterialListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RawMaterialNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:rawID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RawMaterialEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'rm',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RMListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RMNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:rawID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RMEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'assign',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AssignListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AssignNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:assignID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AssignEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:assignID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AssignApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'itemOpenDatabase',
            element: (
              <RoleGuard allowedRoles={[70, 80, 88, 87, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenDatabaseListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenDatabaseNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ItemOpenDatabaseID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenDatabaseEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'itemOpen',
            element: (
              <RoleGuard allowedRoles={[70, 80, 88, 87, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ItemOpenID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:ItemOpenID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemOpenApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'itemRecieve',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRecieveListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRecieveNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ItemRecieveID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRecieveEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:ItemRecieveID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRecieveApprovalPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:GRNID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRecievePDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'itemRequisition',
            element: (
              <RoleGuard allowedRoles={[70, 80, 88, 87, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRequisitionListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRequisitionNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ItemRequisitionID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRequisitionEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:ItemRequisitionID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemRequisitionApprovalPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'ItemIssue',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemIssueListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'pdf/:IssueID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemIssuePDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'ItemReturnAcknowledgement',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemReturnAcknowledgementListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'pdf/:GRNID/:ItemOpenID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemReturnAcknowledgementPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'WasteVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:Voucher_ID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemVoucherPDFPage />
                  </Suspense>
                ),
              },
              // WasteVoucherEditPage
              {
                path: 'edit/:VID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'TransferVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:TransferMstID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:TransferMstID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // Procurement
      {
        path: 'procurement',
        element: (
          <RoleGuard allowedRoles={[87, 88, 70, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          // pr
          {
            path: 'pr',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PrListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PrNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:prID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PrEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:prID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PrApprovalPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:prID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PrPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          // po
          {
            path: 'po',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PoListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PoNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:POID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PoEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'approval/:POID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PoApprovalPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:POID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <PoPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // R&D
      {
        path: 'rd-lab',
        element: (
          <RoleGuard allowedRoles={[70, 80, 85, 89, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'recipe',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RecipeListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RecipeNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:recipeID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RecipeEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      // production
      {
        path: 'production',
        element: (
          <RoleGuard allowedRoles={[70, 80, 85, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [

          {
            path: 'WasteVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:Voucher_ID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ItemVoucherPDFPage />
                  </Suspense>
                ),
              },
              // WasteVoucherEditPage
              {
                path: 'edit/:VID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <WasteVoucherEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'TransferVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:TransferMstID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:TransferMstID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferVoucherPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'ProductRequest',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductRequestListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductRequestNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductRequestPDFPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductRequestEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'ProductVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductVoucherNewPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'TransferPIVoucher',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferPIVoucherListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <TransferPIVoucherNewPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'GoodsRecievedConfirmation',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <GoodsRecievedConfirmationListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <GoodsRecievedConfirmationNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:GRNID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <GoodsRecievedConfirmationEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <GoodsRecievedConfirmationPDFPage />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: 'ProductionReport',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]} allowedSectionIDs={[5, 26]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionReportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionReportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionPDFPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionReportEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'RTReport',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]} allowedSectionIDs={[5, 29]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RTReportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RTReportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <RTReportPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'BlowReport',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]} allowedSectionIDs={[5, 24]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BlowReportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BlowReportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BlowReportEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <BlowReportPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'CardReport',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CardReportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CardReportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CardReportPDFPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CardReportEditPage />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: 'DrawReport',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DrawReportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DrawReportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:ReportID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DrawReportPDFPage />
                  </Suspense>
                ),
              },
            ],
          },



          {
            path: 'maintenance',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <MaintenanceScheduleListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'schedule',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <MaintenanceScheduleListPage />
                  </Suspense>
                ),
              },
              {
                path: 'schedule/new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <MaintenanceScheduleNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'MCheckList',
                element: (
                  <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                    <Outlet />
                  </RoleGuard>
                ),
                children: [
                  {
                    element: (
                      <Suspense fallback={<LoadingScreen />}>
                        <MCheckListPage />
                      </Suspense>
                    ),
                    index: true,
                  },
                  {
                    path: 'new',
                    element: (
                      <Suspense fallback={<LoadingScreen />}>
                        <MCheckListNewPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: 'pdf/:ReportID/',
                    element: (
                      <Suspense fallback={<LoadingScreen />}>
                        <MCheckListPDF />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: 'Planning/productionMiddleware',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionMiddlewareListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionMiddlewareNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ProductionMiddlewareID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionMiddlewareEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'Planning/productionBucket',
            element: (
              <RoleGuard allowedRoles={[70, 80, 85, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionBucketListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionBucketNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ProductionBucketID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionBucketEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'Planning/production',
            element: (
              <RoleGuard allowedRoles={[70, 80, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:productionID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProductionEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // commercial

      {
        path: 'commercial',
        element: (
          <RoleGuard allowedRoles={[87, 88, 70, 898]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          {
            path: 'exp/ExportInvoice',
            element: (
              <RoleGuard allowedRoles={[87, 88, 70, 898]}>
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CommercialListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CommercialNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'add/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CommercialEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ExportInvoiceID',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CommercialEditPage />
                  </Suspense>
                ),
              },
              // },
              {
                path: 'pdf/:ExportInvoiceID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <CommercialPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'exp/Export',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ExID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'view/:ExID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportViewPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:piID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportPDFPage />
                  </Suspense>
                ),
              },
              {
                path: 'amendment/:ExID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ExportAmendmentPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'exp/documentsubmission',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocSubmitListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocSubmitNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:DocID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocSubmitEditPage />
                  </Suspense>
                ),
              },
              {
                path: 'pdf/:SubmissionID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocSubmitPDFPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'exp/docRealization',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocRealizationListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocRealizationNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:DocID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DocRealizationEditPage />
                  </Suspense>
                ),
              },
              // {
              //   path: 'pdf/:SubmissionID/',
              //   element: (
              //     <Suspense fallback={<LoadingScreen />}>
              //       <DocSubmitPDFPage />
              //     </Suspense>
              //   ),
              // },
            ],
          },

          {
            path: 'import/ImportPIRegister',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportPIRegisterListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportPIRegisterNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ImportPIRegisterID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportPIRegisterEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'import/ImportLCInfo',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCInfoListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCInfoNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ImportLCInfoID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCInfoEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'import/ImportInvoiceEntry',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportInvoiceEntryListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportInvoiceEntryNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ImportInvoiceEntryID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportInvoiceEntryEditPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'import/ImportLCBillPayment',
            children: [
              {
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCBillPaymentListPage />
                  </Suspense>
                ),
                index: true,
              },
              {
                path: 'new',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCBillPaymentNewPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:ImportLCBillPaymentID/',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ImportLCBillPaymentEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];

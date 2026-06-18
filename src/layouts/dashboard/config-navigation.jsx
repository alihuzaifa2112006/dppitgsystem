import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import SvgColor from 'src/components/svg-color';
import { decrypt } from 'src/api/encryption';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  ai: icon('ic_ai'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  management: icon('ic_management'),
  meeting: icon('ic_meeting'),
  complain: icon('ic_complain'),
  database: icon('ic_database'),
  assignment: icon('ic-assignment'),
  yarn: icon('ic-yarn'),
  clipboard: icon('ic-clipboard'),
  requisition: icon('ic-requisition'),
  download: icon('ic-download'),
  tracking: icon('ic-tracking'),
  tna: icon('ic_tna'),
  delivered: icon('ic-delivered'),
  profileGR: icon('ic_profile_gear'),
  thread: icon('ic_thread'),
  thread2: icon('ic-thread'),
  staff: icon('ic_staff'),
  category: icon('ic_category'),
  tree: icon('ic_tree'),
  editForm: icon('ic_editform'),
  docApproval: icon('ic_doc_approve'),
  emailSent: icon('ic_email_sent'),
  inventory: icon('ic_inventory'),
  procurement: icon('ic_procurement'),
  qc: icon('ic_qc'),
  settings: icon('ic_settings'),
  development: icon('ic_development'),
  production: icon('ic_production'),
  exportInvoice: icon('ic_exportinvoice'),
  reports: icon('ic_report'),
};

// ----------------------------------------------------------------------
export function useNavData() {
  const { t } = useTranslate();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const userRoles = userData?.userDetails?.roles || [];

  const groupARoles = [70, 80];
  const groupBRoles = [85, 70];
  const InvRoles = [87, 88, 70];
  const QCRoles = [89, 70];
  const allButInvnQC = [
    64, 65, 66, 67, 68, 69, 70, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 89,
  ];
  const HRRoles = [1, 2, 3, 4];

  // const groupBRoles = [64, 65, 66, 67, 70, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83];
  const isTest = userData?.userDetails?.userId === 898;

  const hasRole = (rolesToCheck) => rolesToCheck.some((role) => userRoles.includes(role));
  const hasSectionID = (sectionIDsToCheck) => {
    const userSectionID = userData?.userDetails?.SectionID;
    return sectionIDsToCheck.includes(userSectionID);
  };

  const data = useMemo(() => {
    const navItems = [
      {
        subheader: t('overview'),
        items: [
          {
            title: hasRole(HRRoles) ? t('HR Dashboard') : t('Sales Dashboard'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
        ],
      },
    ];
    // if (hasRole(groupARoles)) {
    //   navItems.push({
    //     subheader: t('Administration'),
    //     items: [
    //       {
    //         title: t('Department'),
    //         path: paths.dashboard.admin.department,
    //         icon: ICONS.banking,
    //       },
    //       {
    //         title: t('Sections'),
    //         path: paths.dashboard.admin.depsection,
    //         icon: ICONS.tree,
    //       },
    //       {
    //         title: t('Staff Category'),
    //         path: paths.dashboard.admin.staff,
    //         icon: ICONS.category,
    //       },
    //       {
    //         title: t('Role'),
    //         path: paths.dashboard.admin.role,
    //         icon: ICONS.job,
    //       },
    //       // {
    //       //   title: t('Form'),
    //       //   path: paths.dashboard.admin.form,
    //       //   icon: ICONS.assignment,
    //       // },
    //       {
    //         title: t('UX Journey'),
    //         path: paths.dashboard.admin.formRole,
    //         icon: ICONS.editForm,
    //       },

    //       {
    //         title: t('User'),
    //         path: paths.dashboard.user.root,
    //         icon: ICONS.user,
    //       },
    //       {
    //         title: t('Terms & Condition / Clause'),
    //         path: paths.dashboard.admin.clause,
    //         icon: ICONS.clipboard,
    //       },
    //       {
    //         title: t('Document Approval'),
    //         path: paths.dashboard.admin.docApproval.root,
    //         icon: ICONS.docApproval,
    //       },
    //     ],
    //   });
    // }

    if (
      hasRole(groupARoles) ||
      hasRole(groupBRoles) ||
      hasRole(InvRoles) ||
      hasRole(QCRoles) ||
      hasRole(HRRoles)
    ) {
      navItems.push({
        subheader: t('Application'),
        items: [
          hasRole(groupARoles) && {
            title: t('Administration Module'),
            icon: ICONS.job,
            path: paths.dashboard.admin.root,

            children: [
              // {
              //   title: t('Department'),
              //   path: paths.dashboard.admin.department,
              //   // icon: ICONS.banking,
              // },
              // {
              //   title: t('Sections'),
              //   path: paths.dashboard.admin.depsection,
              //   // icon: ICONS.tree,
              // },
              // {
              //   title: t('Staff Category'),
              //   path: paths.dashboard.admin.staff,
              //   // icon: ICONS.category,
              // },
              // {
              //   title: t('Role'),
              //   path: paths.dashboard.admin.role,
              //   // icon: ICONS.job,
              // },
              // {
              //   title: t('Form'),
              //   path: paths.dashboard.admin.form,
              //   icon: ICONS.assignment,
              // },

              // {
              //   title: t('UX Journey'),
              //   path: paths.dashboard.admin.formRole,
              //   // icon: ICONS.editForm,
              // },

              {
                title: t('User'),
                path: paths.dashboard.user.root,
                // icon: ICONS.user,
              },
              {
                title: t('Vendor'),
                path: paths.dashboard.admin.vendor.root,
                // icon: ICONS.user,
              },
              // {
              //   title: t('Terms & Condition / Clause'),
              //   path: paths.dashboard.admin.clause,
              //   // icon: ICONS.clipboard,
              // },
              // {
              //   title: t('Blend Names'),
              //   path: paths.dashboard.admin.blendname,
              //   // icon: ICONS.assignment,
              // },
              {
                title: t('Document Approval'),
                path: paths.dashboard.admin.docApproval.root,
                // icon: ICONS.docApproval,
                children: [
                  {
                    title: t('Approver'),
                    path: paths.dashboard.admin.docApproval.root,
                    // icon: ICONS.docApproval,
                  },
                  {
                    title: t('Approver Signature'),
                    path: paths.dashboard.admin.docApproval.signature,
                    // icon: ICONS.docApproval,
                  },
                ],
              },
              // {
              //   title: t('Unit Location'),
              //   path: paths.dashboard.admin.location,
              //   // icon: ICONS.banking,
              // },
              // {
              //   title: t('Storage Location'),
              //   path: paths.dashboard.admin.room,
              //   // icon: ICONS.banking,
              // },
              // {
              //   title: t('Inventory Category'),
              //   path: paths.dashboard.admin.category,
              //   // icon: ICONS.banking,
              // },
              // {
              //   title: t('Item Type'),
              //   path: paths.dashboard.admin.invType,
              //   // icon: ICONS.banking,
              // },
              // {
              //   title: t('Supplier'),
              //   path: paths.dashboard.admin.SupplierProfile.root,
              //   // icon: ICONS.banking,
              // },
            ],
          },
          hasRole(groupARoles) && {
            title: t('Power Tools'),
            icon: ICONS.settings,
            path: paths.dashboard.powertools.root,

            children: [
              // administrative
              {
                title: t('Administrative'),
                path: paths.dashboard.powertools.administrative.root,
                children: [
                  {
                    title: t('Role'),
                    path: paths.dashboard.powertools.administrative.role,
                    // icon: ICONS.job,
                  },
                  // {
                  //   title: t('Department'),
                  //   path: paths.dashboard.admin.department,
                  //   // icon: ICONS.banking,
                  // },
                  // {
                  //   title: t('Sections'),
                  //   path: paths.dashboard.admin.depsection,
                  //   // icon: ICONS.tree,
                  // },
                  // {
                  //   title: t('Staff Category'),
                  //   path: paths.dashboard.admin.staff,
                  //   // icon: ICONS.category,
                  // },
                  // {
                  //   title: t('Form'),
                  //   path: paths.dashboard.admin.form,
                  //   icon: ICONS.assignment,
                  // },

                  {
                    title: t('UX Journey'),
                    path: paths.dashboard.powertools.administrative.formRole,
                    // icon: ICONS.editForm,
                  },
                  {
                    title: t('Unit Of Measure'),
                    path: paths.dashboard.powertools.administrative.uom,
                    // icon: ICONS.editForm,
                  },
                ],
              },
              // crm
              {
                title: t('CRM'),
                path: paths.dashboard.powertools.crm.root,
                children: [
                  {
                    title: t('country'),
                    path: paths.dashboard.powertools.crm.country,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('city'),
                    path: paths.dashboard.powertools.crm.city,
                    // icon: ICONS.banking,
                  },

                  {
                    title: t('Terms & Condition / Clause'),
                    path: paths.dashboard.powertools.crm.clause,
                    // icon: ICONS.clipboard,
                  },
                  {
                    title: t('Blend Names'),
                    path: paths.dashboard.powertools.crm.blendname,
                    // icon: ICONS.assignment,
                  },
                  {
                    title: t('Fabric Type'),
                    path: paths.dashboard.powertools.crm.fabric,
                    // icon: ICONS.assignment,
                  },
                ],
              },
              // inv
              {
                title: t('Inventory'),
                path: paths.dashboard.powertools.inventory.root,
                children: [
                  {
                    title: t('Item Type'),
                    path: paths.dashboard.powertools.inventory.InvType,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Category'),
                    path: paths.dashboard.powertools.inventory.category,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Sub Category'),
                    path: paths.dashboard.powertools.inventory.subcategory,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Specification'),
                    path: paths.dashboard.powertools.inventory.specification,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Spare Parts'),
                    path: paths.dashboard.powertools.inventory.spareparts,
                    // icon: ICONS.banking,
                  },

                  // {
                  //   title: t('Unit Location'),
                  //   path: paths.dashboard.admin.location,
                  //   // icon: ICONS.banking,
                  // },
                  // {
                  //   title: t('Storage Location'),
                  //   path: paths.dashboard.admin.room,
                  //   // icon: ICONS.banking,
                  // },
                  // {
                  //   title: t('Inventory Category'),
                  //   path: paths.dashboard.admin.category,
                  //   // icon: ICONS.banking,
                  // },
                  // {
                  //   title: t('Item Type'),
                  //   path: paths.dashboard.admin.invType,
                  //   // icon: ICONS.banking,
                  // },
                  // {
                  //   title: t('Supplier'),
                  //   path: paths.dashboard.admin.SupplierProfile.root,
                  //   // icon: ICONS.banking,
                  // },
                  {
                    title: t('Purpose'),
                    path: paths.dashboard.powertools.inventory.purpose,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t(' Fiscal Budget'),
                    path: paths.dashboard.powertools.inventory.budget,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Machine'),
                    path: paths.dashboard.powertools.inventory.Machine,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Request Middleware'),
                    path: paths.dashboard.powertools.inventory.ReqMiddleware,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Charges Type'),
                    path: paths.dashboard.powertools.inventory.ChargeType,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Origin Factor'),
                    path: paths.dashboard.powertools.inventory.OriginFactor,
                    // icon: ICONS.banking,
                  },
                  {
                    title: t('Quality Factor'),
                    path: paths.dashboard.powertools.inventory.QualityFactor,
                    // icon: ICONS.banking,
                  },
                ],
              },

              // Commercial
              {
                title: t('Commercial'),
                path: paths.dashboard.powertools.crm.root,
                children: [
                  {
                    title: t('Bank Management'),
                    path: paths.dashboard.powertools.Commercial.OpeningBank,
                    // icon: ICONS.banking,
                  },
                ],
              },
            ],
          },

          // HR start

          hasRole(HRRoles) && {
            title: t('General Setup'),
            icon: ICONS.settings,
            path: paths.dashboard.HR_Module.Setup.root,
            children: [
              {
                title: t('Section'),
                path: paths.dashboard.HR_Module.Setup.section,
                // icon: ICONS.invoice,
              },
              {
                title: t('Department'),
                path: paths.dashboard.HR_Module.Setup.department,
                // icon: ICONS.invoice,
              },
              {
                title: t('Designation'),
                path: paths.dashboard.HR_Module.Setup.designation,
                // icon: ICONS.invoice,
              },
              {
                title: t('Holidays'),
                path: paths.dashboard.HR_Module.Setup.holidays,
                // icon: ICONS.invoice,
              },
              {
                title: t('Employee Dismissal'),
                path: paths.dashboard.HR_Module.Setup.EmployeeDismissal.view,
                // icon: ICONS.invoice,
              },
            ],
          },

          hasRole(HRRoles) && {
            title: t('Profile'),
            icon: ICONS.staff,
            path: paths.dashboard.HR_Module.HR_Users.root,
            children: [
              // {
              //   title: t('Export Invoice'),
              //   path: paths.dashboard.Commercial.export.ExportInvoice.root,
              //   // icon: ICONS.invoice,
              // },
              {
                title: t('HR Employee'),
                path: paths.dashboard.HR_Module.HR_Users.root,
                // icon: ICONS.invoice,
              },
            ],
          },
          hasRole(HRRoles) && {
            title: t('Policy'),
            icon: ICONS.assignment,
            path: paths.dashboard.HR_Module.Policy.root,
            children: [
              {
                title: t('Monthly Shift Roster'),
                path: paths.dashboard.HR_Module.Policy.ShiftRoster,
                // icon: ICONS.invoice,
              },
            ],
          },
          hasRole(HRRoles) && {
            title: t('Payroll'),
            icon: ICONS.management,
            path: paths.dashboard.HR_Module.Salary.root,
            children: [
              {
                title: t('Salary Setup'),
                path: paths.dashboard.HR_Module.Salary.Setup.list,
                // icon: ICONS.invoice,
              },
            ],
          },

          //  HR end

          hasRole(groupARoles) && {
            title: t('Production Module'),
            icon: ICONS.thread2,
            path: paths.dashboard.productManagement.root,
            children: [
              { title: t('Yarn Type'), path: paths.dashboard.productManagement.yarnType },
              {
                title: t('CYCLO Color & Code'),
                path: paths.dashboard.productManagement.colorDatabase.root,
              },
              {
                title: t('Yarn Count'),
                path: paths.dashboard.productManagement.yarnCount.root,
              },
              {
                title: t('Yarn Composition'),
                path: paths.dashboard.productManagement.composition.root,
              },
            ],
          },
          hasRole(groupARoles) && {
            title: t('Customer Module'),
            path: paths.dashboard.customer.root,
            icon: ICONS.management,
            children: [
              {
                title: t('Main Buyer'),
                icon: (
                  <SvgColor
                    src="/assets/icons/navbar/ic_endcustomer.svg"
                    sx={{ width: 0.7, height: 1, marginLeft: 1 }}
                  />
                ),
                path: paths.dashboard.customer.endCustomer.root,
              },
              {
                title: t('Agency'),
                icon: (
                  <SvgColor
                    src="/assets/icons/navbar/ic_agent.svg"
                    sx={{ width: 0.7, height: 1, marginLeft: 1 }}
                  />
                ),
                path: paths.dashboard.customer.agency.root,
              },
              // {
              //   title: t('Walk in customer'),
              //   icon: (
              //     <SvgColor
              //       src="/assets/icons/navbar/ic_analytics.svg"
              //       sx={{ width: 0.7, height: 1, marginLeft: 1 }}
              //     />
              //   ),
              //   path: paths.dashboard.customer.wic.root,
              // },
              {
                title: t('Customer'),
                icon: (
                  <SvgColor
                    src="/assets/icons/navbar/ic-clipboard.svg"
                    sx={{ width: 0.7, height: 1, marginLeft: 1 }}
                  />
                ),
                path: paths.dashboard.customer.profile.root,
              },
              // {
              //   title: t('Onboard Customer'),
              //   icon: (
              //     <SvgColor
              //       src="/assets/icons/navbar/ic_invite.svg"
              //       sx={{ width: 0.7, height: 1, marginLeft: 1 }}
              //     />
              //   ),
              //   path: paths.dashboard.customer.inviteWIC.root,
              // },
              {
                title: t('Coversheet'),
                icon: (
                  <SvgColor
                    src="/assets/icons/navbar/ic_userboy.svg"
                    sx={{ width: 0.7, height: 1, marginLeft: 1 }}
                  />
                ),
                path: paths.dashboard.customer.coversheet.root,
              },
              {
                title: t('Compliance Status'),
                icon: (
                  <SvgColor
                    src="/assets/icons/navbar/ic_calendar.svg"
                    sx={{ width: 0.7, height: 1, marginLeft: 1 }}
                  />
                ),
                path: paths.dashboard.customer.compliance.root,
              },
            ],
          },
          // hasRole(groupARoles) && {
          //   title: t('Email History'),
          //   icon: ICONS.emailSent,
          //   path: paths.dashboard.email.root,
          //   children: [
          //     {
          //       title: t('PI History'),
          //       path: paths.dashboard.email.pi,
          //     },
          //   ],
          // },

          hasRole(allButInvnQC) && {
            title: t('Transaction Module'),
            path: paths.dashboard.transaction.root,
            icon: ICONS.invoice,
            children: [
              {
                title: t('Pricelist'),
                path: paths.dashboard.transaction.priceList.root,
              },
              {
                title: t('Opportunity'),
                path: paths.dashboard.transaction.opportunity.root,
                // icon: ICONS.booking,
              },
              {
                title: t('Quotation'),
                path: paths.dashboard.transaction.quotation.root,
                // icon: ICONS.invoice,
              },
              {
                title: t('Sample Request'),
                path: paths.dashboard.transaction.sample.root,
                // icon: ICONS.invoice,
              },
              {
                title: t('Proforma Invoice'),
                path: paths.dashboard.transaction.pi.root,
                // icon: ICONS.invoice,
              },
              {
                title: t('Dispatch Order'),
                path: paths.dashboard.transaction.dispoder.root,
                // icon: ICONS.invoice,
              },
            ],
          },
          hasRole(allButInvnQC) && {
            title: t('Customer Claim'),
            icon: ICONS.assignment,
            path: paths.dashboard.customerClaim.root,
            children: [
              // {
              //   title: t('Dispatched Orders'),
              //   path: paths.dashboard.customerClaim.dispoder.root,
              //   // icon: ICONS.invoice,
              // },
              {
                title: t('Claim Form'),
                path: paths.dashboard.customerClaim.claimForm,
                // icon: ICONS.invoice,
              },
              {
                title: t('Claim Monitor'),
                path: paths.dashboard.customerClaim.monitor.root,
                // icon: ICONS.invoice,
              },
              {
                title: t('Claim Audit'),
                path: paths.dashboard.customerClaim.claimAudits.root,
                // icon: ICONS.invoice,
              },
              // {
              //   title: t('Claim Investigation'),
              //   path: paths.page404,
              //   // icon: ICONS.invoice,
              // },
            ],
          },
          hasRole(InvRoles) && {
            title: t('Procurement'),
            icon: ICONS.procurement,
            path: paths.dashboard.procurement.root,
            children: [
              {
                title: t('Purchase Request'),
                path: paths.dashboard.procurement.pr.root,
              },
              {
                title: t('Purchase Order'),
                path: paths.dashboard.procurement.po.root,
              },
            ],
          },
          hasRole(InvRoles) && {
            title: t('Inventory Management'),
            icon: ICONS.inventory,
            path: paths.dashboard.InventoryManagement.root,
            children: [
              {
                title: t('Item Open'),
                path: paths.dashboard.InventoryManagement.ItemOpenDatabase.root,
              },
              {
                title: t('Item Transaction'),
                path: paths.dashboard.InventoryManagement.ItemOpen.root,
              },

              {
                title: t('Item Receive'),
                path: paths.dashboard.InventoryManagement.ItemRecieve.root,
              },
              // {
              //   title: t('Item Requisition'),
              //   path: paths.dashboard.InventoryManagement.ItemRequisition.root,
              // },
              {
                title: t('Item Issue'),
                path: paths.dashboard.InventoryManagement.ItemIssue.root,
              },
              // {
              //   title: t('Item Voucher'),
              //   path: paths.dashboard.InventoryManagement.WasteVoucher.root,
              // },
              // {
              //   title: t('Item Transfer Voucher'),
              //   path: paths.dashboard.InventoryManagement.TransferVoucher.root,
              // },
              {
                title: t('Stock Acknowledgement'),
                path: paths.dashboard.InventoryManagement.ItemReturnAcknowledgement.root,
              },
            ],
          },
          hasRole(InvRoles) && {
            title: t('Reports'),
            icon: ICONS.file,
            path: paths.dashboard.reports.root,
            children: [
              {
                title: t('Stock Report'),
                path: paths.dashboard.reports.stockReport,
              },
              // {
              //   title: t('PSF Issue Report'),
              //   path: paths.dashboard.reports.PSFIssueReport,
              // },
            ],
          },
          hasRole(QCRoles) && {
            title: t('Quality Control (QC)'),
            icon: ICONS.qc,
            path: paths.dashboard.QC.root,
            children: [
              {
                title: t('Item'),
                path: paths.dashboard.QC.Item.root,
              },
            ],
          },
          hasRole(allButInvnQC) && {
            title: t('R&D Lab'),
            icon: ICONS.development,
            path: paths.dashboard.rdLab.root,
            children: [
              {
                title: t('Recipe'),
                path: paths.dashboard.rdLab.recipe.root,
                // icon: ICONS.invoice,
              },
            ],
          },
          hasRole(allButInvnQC) && {
            title: t('AI Plans'),
            icon: ICONS.ai,
            path: paths.dashboard.AIPlans.root,
            children: [
              {
                title: t('Material Price'),
                path: paths.dashboard.AIPlans.CostingPlan.root,
              },
              {
                title: t('Create AI Plan'),
                path: paths.dashboard.AIPlans.root,
                // icon: ICONS.invoice,
              },
            ],
          },
          hasRole(allButInvnQC) && {
            title: t('Production'),
            icon: ICONS.production,
            path: paths.dashboard.Production.root,

            children: [
              {
                title: t('Departmental Requisition'),
                path: paths.dashboard.Production.ProductRequest.root,
              },
              {
                title: t('Goods Recieved Confirmation'),
                path: paths.dashboard.Production.GoodsRecievedConfirmation.root,
              },

              hasSectionID([5, 26]) && {
                title: t('Production Report (Sorting)'),
                path: paths.dashboard.Production.ProductionReport.root,
              },
              hasSectionID([5, 29]) && {
                title: t('Production Report (MARGASA)'),
                path: paths.dashboard.Production.RTReport.root,
              },
              hasSectionID([5, 24]) && {
                title: t('Production Report (Blow Room)'),
                path: paths.dashboard.Production.BlowReport.root,
              },
              {
                title: t('Production Report (Carding Report)'),
                path: paths.dashboard.Production.CardReport.root,
              },
              {
                title: t('Production Report (Drawing Report)'),
                path: paths.dashboard.Production.DrawReport.root,
              },

              {
                title: t('Item Voucher'),
                path: paths.dashboard.Production.WasteVoucher.root,
              },
              {
                title: t('Item Transfer Voucher'),
                path: paths.dashboard.Production.TransferVoucher.root,
              },
              {
                title: t('Production Voucher'),
                path: paths.dashboard.Production.ProductVoucher.root,
              },
              {
                title: t('Transfer Voucher'),
                path: paths.dashboard.Production.TransferPIVoucher.root,
              },
              {
                title: t('Planning'),
                path: paths.dashboard.Production.Planning.root,
                children: [
                  {
                    title: t('Production Middleware'),
                    path: paths.dashboard.Production.Planning.ProductionMiddleware.root,
                  },
                  {
                    title: t('AI Bucket'),
                    path: paths.dashboard.Production.Planning.ProductionBucket.root,
                  },
                  {
                    title: t('Production Planning'),
                    path: paths.dashboard.Production.Planning.production.root,
                  },
                ],
              },
              {
                title: t('Maintenance'),
                path: paths.dashboard.Production.maintenance.root,
                children: [
                  {
                    title: t('Maintenance Schedule'),
                    path: paths.dashboard.Production.maintenance.schedule.root,
                  },
                  {
                    title: t('Maintenance Checklist'),
                    path: paths.dashboard.Production.maintenance.MCheckList.root,
                  },
                ],
              },
            ].filter(Boolean),
          },
          hasRole(allButInvnQC) && {
            title: t('Commercial Module'),
            icon: ICONS.exportInvoice,
            path: paths.dashboard.Commercial.root,
            children: [
              {
                title: t('Export'),
                // icon: ICONS.exportInvoice,
                path: paths.dashboard.Commercial.export.root,
                children: [
                  {
                    title: t('L/C Tagging'),
                    path: paths.dashboard.Commercial.export.ExportLC.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Export Invoice'),
                    path: paths.dashboard.Commercial.export.ExportInvoice.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Document Submission'),
                    path: paths.dashboard.Commercial.export.DocumentSubmission.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Document Realization'),
                    path: paths.dashboard.Commercial.export.DocumentRealization.root,
                    // icon: ICONS.invoice,
                  },
                ],
              },
              {
                title: t('Import'),
                // icon: ICONS.exportInvoice,
                path: paths.dashboard.Commercial.import.root,
                children: [
                  {
                    title: t('PI Register'),
                    path: paths.dashboard.Commercial.import.ImportPIRegister.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Import LC'),
                    path: paths.dashboard.Commercial.import.ImportLCInfo.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Import Invoice Entry'),
                    path: paths.dashboard.Commercial.import.ImportInvoiceEntry.root,
                    // icon: ICONS.invoice,
                  },
                  {
                    title: t('Import LC Bill Payment'),
                    path: paths.dashboard.Commercial.import.ImportLCBillPayment.root,
                    // icon: ICONS.invoice,
                  },
                ],
              },
            ],
          },
        ].filter(Boolean),
      });
    }

    // if (isTest) {
    //   navItems.push({
    //     subheader: t('Application'),
    //     items: [
    //       {
    //         title: t('Administration Module'),
    //         icon: ICONS.job,
    //         path: paths.dashboard.admin.root,

    //         children: [
    //           {
    //             title: t('Inventory Category'),
    //             path: paths.dashboard.admin.category,
    //             // icon: ICONS.banking,
    //           },
    //           {
    //             title: t('Sub Category'),
    //             path: paths.dashboard.admin.subcategory,
    //             // icon: ICONS.banking,
    //           },
    //           {
    //             title: t('Forms'),
    //             path: paths.dashboard.admin.forms.root,
    //             // icon: ICONS.banking,
    //           },
    //         ],
    //       },
    //     ],
    //   });
    // }

    return navItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, userRoles]);

  return data;
}

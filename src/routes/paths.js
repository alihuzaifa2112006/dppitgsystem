import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/app',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/403',
  page404: '/404',
  page500: '/500',
  complaintRegistrationForm: (id) => `/complaint-registration-form/${id}`,
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      verify: `${ROOTS.AUTH}/jwt/verify`,
      forgot: `${ROOTS.AUTH}/jwt/forgot`,
      newpassword: `${ROOTS.AUTH}/jwt/new-password`,
      registerOrg: `${ROOTS.AUTH}/jwt/registerOrg`,
      registerWIC: `${ROOTS.AUTH}/jwt/registerWIC`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    calendar: `${ROOTS.DASHBOARD}/calendar`,

    user: {
      root: `${ROOTS.DASHBOARD}/admin/user`,
      new: `${ROOTS.DASHBOARD}/admin/user/new`,
      list: `${ROOTS.DASHBOARD}/admin/user/list`,
      cards: `${ROOTS.DASHBOARD}/admin/user/cards`,
      profile: `${ROOTS.DASHBOARD}/admin/user/profile`,
      account: `${ROOTS.DASHBOARD}/admin/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/admin/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
      forms: {
        root: `${ROOTS.DASHBOARD}/admin/forms`,
        new: `${ROOTS.DASHBOARD}/admin/forms/new`,
        form: `${ROOTS.DASHBOARD}/admin/forms/form`,
        edit: (FormID) => `${ROOTS.DASHBOARD}/admin/forms/edit/${FormID}`,
      },
      category: `${ROOTS.DASHBOARD}/admin/inv-category`,
      subcategory: `${ROOTS.DASHBOARD}/admin/subcategory`,
    },

    admin: {
      root: `${ROOTS.DASHBOARD}/admin`,
      role: `${ROOTS.DASHBOARD}/admin/role`,
      department: `${ROOTS.DASHBOARD}/admin/department`,
      location: `${ROOTS.DASHBOARD}/admin/location`,
      room: `${ROOTS.DASHBOARD}/admin/room`,
      depsection: `${ROOTS.DASHBOARD}/admin/section`,
      form: `${ROOTS.DASHBOARD}/admin/form`,
      formRole: `${ROOTS.DASHBOARD}/admin/formRole`,
      staff: `${ROOTS.DASHBOARD}/admin/staff`,
      blendname: `${ROOTS.DASHBOARD}/admin/blendname`,
      clause: `${ROOTS.DASHBOARD}/admin/clause`,
      invType: `${ROOTS.DASHBOARD}/admin/inventoryType`,
      vendor: {
        root: `${ROOTS.DASHBOARD}/admin/vendor`,
        list: `${ROOTS.DASHBOARD}/admin/vendor/view`,
        new: `${ROOTS.DASHBOARD}/admin/vendor/new`,
        edit: (vendorID) => `${ROOTS.DASHBOARD}/admin/vendor/edit/${vendorID}`,
      },
      docApproval: {
        root: `${ROOTS.DASHBOARD}/admin/doc-approval`,
        list: `${ROOTS.DASHBOARD}/admin/doc-approval/list`,
        signature: `${ROOTS.DASHBOARD}/admin/doc-approval/signature`,
        new: `${ROOTS.DASHBOARD}/admin/doc-approval/new`,
        edit: (docApprovalID) => `${ROOTS.DASHBOARD}/admin/doc-approval/edit/${docApprovalID}`,
      },
      SupplierProfile: {
        root: `${ROOTS.DASHBOARD}/admin/supplier-profile`,
        new: `${ROOTS.DASHBOARD}/admin/supplier-profile/new`,
        edit: (supplierProfileID) =>
          `${ROOTS.DASHBOARD}/admin/supplier-profile/edit/${supplierProfileID}`,
        account: `${ROOTS.DASHBOARD}/admin/supplier-profile/account`,
        notifications: `${ROOTS.DASHBOARD}/admin/supplier-profile/notifications`,
      },
      forms: {
        root: `${ROOTS.DASHBOARD}/admin/forms`,
        new: `${ROOTS.DASHBOARD}/admin/forms/new`,
        form: `${ROOTS.DASHBOARD}/admin/forms/form`,
        edit: (FormID) => `${ROOTS.DASHBOARD}/admin/forms/edit/${FormID}`,
      },
      category: `${ROOTS.DASHBOARD}/admin/inv-category`,
      subcategory: `${ROOTS.DASHBOARD}/admin/subcategory`,
    },

    reports: {
      root: `${ROOTS.DASHBOARD}/reports`,
      stockReport: `${ROOTS.DASHBOARD}/reports/stockReport`,
      ColorWiseStockReport: `${ROOTS.DASHBOARD}/reports/ColorWiseStockReport`,
      PSFIssueReport: `${ROOTS.DASHBOARD}/reports/PSFIssueReport`,
    },

    // HR
    HR_Module: {
      root: `${ROOTS.DASHBOARD}/HR_Module`,
      HR_Users: {
        root: `${ROOTS.DASHBOARD}/HR_Module/user`,
        new: `${ROOTS.DASHBOARD}/HR_Module/user/new`,
        list: `${ROOTS.DASHBOARD}/HR_Module/user/list`,
        cards: (id) => `${ROOTS.DASHBOARD}/HR_Module/user/${id}`,
        profile: `${ROOTS.DASHBOARD}/HR_Module/profile`,
        account: `${ROOTS.DASHBOARD}/HR_Module/account`,
        edit: (id) => `${ROOTS.DASHBOARD}/HR_Module/user/edit/${id}`,
        policy: (id) => `${ROOTS.DASHBOARD}/HR_Module/user/policy/${id}`,
        demo: {
          edit: `${ROOTS.DASHBOARD}/${MOCK_ID}/edit`,
        },
      },
      Setup: {
        root: `${ROOTS.DASHBOARD}/HR_Module/setup`,
        section: `${ROOTS.DASHBOARD}/HR_Module/setup/section`,
        department: `${ROOTS.DASHBOARD}/HR_Module/setup/department`,
        designation: `${ROOTS.DASHBOARD}/HR_Module/setup/designation`,
        holidays: `${ROOTS.DASHBOARD}/HR_Module/setup/holidays`,
        EmployeeDismissal: {
          root: `${ROOTS.DASHBOARD}/HR_Module/setup/EmployeeDismissal`,
          view: `${ROOTS.DASHBOARD}/HR_Module/setup/EmployeeDismissal/view`,
          new: `${ROOTS.DASHBOARD}/HR_Module/setup/EmployeeDismissal/new`,
          edit: (id) => `${ROOTS.DASHBOARD}/HR_Module/setup/EmployeeDismissal/edit/${id}`,
          // pdf: (id) => `${ROOTS.DASHBOARD}/HR_Module/salarysetup/pdf/${id}`,
        },
      },
      Salary: {
        root: `${ROOTS.DASHBOARD}/HR_Module/Salary`,
        Setup: {
          root: `${ROOTS.DASHBOARD}/HR_Module/Salary/setup`,
          list: `${ROOTS.DASHBOARD}/HR_Module/Salary/setup/list`,
          new: `${ROOTS.DASHBOARD}/HR_Module/Salary/setup/new`,
          edit: (id) => `${ROOTS.DASHBOARD}/HR_Module/Salary/setup/edit/${id}`,
          // pdf: (id) => `${ROOTS.DASHBOARD}/HR_Module/salarysetup/pdf/${id}`,
        },
      },
      Policy: {
        root: `${ROOTS.DASHBOARD}/HR_Module/Policy`,
        ShiftRoster: `${ROOTS.DASHBOARD}/HR_Module/Policy/ShiftRoster`,
      },
    },

    QC: {
      root: `${ROOTS.DASHBOARD}/QC`,
      Item: {
        root: `${ROOTS.DASHBOARD}/QC/item`,
      },
    },

    powertools: {
      root: `${ROOTS.DASHBOARD}/powertools`,
      administrative: {
        root: `${ROOTS.DASHBOARD}/powertools/administrative`,
        role: `${ROOTS.DASHBOARD}/powertools/administrative/role`,
        formRole: `${ROOTS.DASHBOARD}/powertools/administrative/formRole`,
        uom: `${ROOTS.DASHBOARD}/powertools/administrative/uom`,
      },
      crm: {
        root: `${ROOTS.DASHBOARD}/powertools/crm`,
        country: `${ROOTS.DASHBOARD}/powertools/crm/country`,
        fabric: `${ROOTS.DASHBOARD}/powertools/crm/fabric`,
        city: `${ROOTS.DASHBOARD}/powertools/crm/city`,
        blendname: `${ROOTS.DASHBOARD}/powertools/crm/blendname`,
        clause: `${ROOTS.DASHBOARD}/powertools/crm/clause`,
      },
      inventory: {
        root: `${ROOTS.DASHBOARD}/powertools/inventory`,
        category: `${ROOTS.DASHBOARD}/powertools/inventory/inv-category`,
        subcategory: `${ROOTS.DASHBOARD}/powertools/inventory/subcategory`,
        purpose: `${ROOTS.DASHBOARD}/powertools/inventory/purpose`,
        specification: `${ROOTS.DASHBOARD}/powertools/inventory/specification`,
        spareparts: `${ROOTS.DASHBOARD}/powertools/inventory/spareparts`,
        budget: `${ROOTS.DASHBOARD}/powertools/inventory/budget`,
        InvType: `${ROOTS.DASHBOARD}/powertools/inventory/InvType`,
        ReqMiddleware: `${ROOTS.DASHBOARD}/powertools/inventory/reqMiddleware`,
        ChargeType: `${ROOTS.DASHBOARD}/powertools/inventory/ChargeType`,
        Machine: `${ROOTS.DASHBOARD}/powertools/inventory/Machine`,
        QualityFactor: `${ROOTS.DASHBOARD}/powertools/inventory/QualityFactor`,
        OriginFactor: `${ROOTS.DASHBOARD}/powertools/inventory/OriginFactor`,
      },
      Commercial: {
        root: `${ROOTS.DASHBOARD}/powertools/commercial`,
        OpeningBank: `${ROOTS.DASHBOARD}/powertools/commercial/OpeningBank`,
      },
    },

    // email history
    email: {
      root: `${ROOTS.DASHBOARD}/email-history`,
      pi: `${ROOTS.DASHBOARD}/email-history/pi`,
      user: `${ROOTS.DASHBOARD}/email-history/user`,
    },

    // PRODUCT
    product: {
      root: `/product`,
      checkout: `/product/checkout`,
      details: (id) => `/product/${id}`,
      demo: {
        details: `/product/${MOCK_ID}`,
      },
    },
    yarnModule: {
      root: `${ROOTS.DASHBOARD}/yarn-module`,
      yarnSetup: {
        root: `${ROOTS.DASHBOARD}/yarn-module/yarn-setup`,
        list: `${ROOTS.DASHBOARD}/yarn-module/yarn-setup/view`,
        new: `${ROOTS.DASHBOARD}/yarn-module/yarn-setup/new`,
        edit: (yarnSetupID) => `${ROOTS.DASHBOARD}/yarn-module/yarn-setup/edit/${yarnSetupID}`,
      },
      yarnContract: {
        root: `${ROOTS.DASHBOARD}/yarn-module/yarn-contract`,
        list: `${ROOTS.DASHBOARD}/yarn-module/yarn-contract/view`,
        new: `${ROOTS.DASHBOARD}/yarn-module/yarn-contract/new`,
        edit: (yarnContractID) =>
          `${ROOTS.DASHBOARD}/yarn-module/yarn-contract/edit/${yarnContractID}`,
      },
    },
    // Product Management
    productManagement: {
      root: `${ROOTS.DASHBOARD}/product-management`,
      yarnType: `${ROOTS.DASHBOARD}/product-management/yarn-type`,
      colorDatabase: {
        root: `${ROOTS.DASHBOARD}/product-management/color-database`,
        new: `${ROOTS.DASHBOARD}/product-management/color-database/new`,
        edit: (colorID) => `${ROOTS.DASHBOARD}/product-management/color-database/edit/${colorID}`,
      },
      composition: {
        root: `${ROOTS.DASHBOARD}/product-management/composition`,
        new: `${ROOTS.DASHBOARD}/product-management/composition/new`,
        edit: (compositionID) =>
          `${ROOTS.DASHBOARD}/product-management/composition/edit/${compositionID}`,
      },
      yarnCount: {
        root: `${ROOTS.DASHBOARD}/product-management/yarn-count`,
        new: `${ROOTS.DASHBOARD}/product-management/yarn-count/new`,
        edit: (yarnCountID) =>
          `${ROOTS.DASHBOARD}/product-management/yarn-count/edit/${yarnCountID}`,
      },
      product: {
        root: `${ROOTS.DASHBOARD}/product-management/product`,
        new: `${ROOTS.DASHBOARD}/product-management/product/new`,
        edit: (productID) => `${ROOTS.DASHBOARD}/product-management/product/edit/${productID}`,
      },
    },

    customer: {
      root: `${ROOTS.DASHBOARD}/customer`,
      list: `${ROOTS.DASHBOARD}/customer/view`,
      new: `${ROOTS.DASHBOARD}/customer/new`,
      edit: (customerID) => `${ROOTS.DASHBOARD}/customer/edit/${customerID}`,
      wic: {
        root: `${ROOTS.DASHBOARD}/customer/wic`,
        list: `${ROOTS.DASHBOARD}/customer/wic/view`,
        new: `${ROOTS.DASHBOARD}/customer/wic/new`,
        edit: (wicID) => `${ROOTS.DASHBOARD}/customer/wic/edit/${wicID}`,
      },

      inviteWIC: {
        root: `${ROOTS.DASHBOARD}/customer/invite`,
        new: `${ROOTS.DASHBOARD}/customer/invite/new`,
        edit: (wicID) => `${ROOTS.DASHBOARD}/customer/invite/edit/${wicID}`,
      },
      coversheet: {
        root: `${ROOTS.DASHBOARD}/customer/coversheet`,
        view: (coversheetID) => `${ROOTS.DASHBOARD}/customer/coversheet/view/${coversheetID}`,
      },
      endCustomer: {
        root: `${ROOTS.DASHBOARD}/customer/end-customer`,
        // list: `${ROOTS.DASHBOARD}/customer/end-customer/view`,
        new: `${ROOTS.DASHBOARD}/customer/end-customer/new`,
        rpt: `${ROOTS.DASHBOARD}/customer/end-customer/rpt`,
        edit: (ECID) => `${ROOTS.DASHBOARD}/customer/end-customer/edit/${ECID}`,
      },
      agent: {
        root: `${ROOTS.DASHBOARD}/customer/agent`,
        list: `${ROOTS.DASHBOARD}/customer/agent/view`,
      },
      agency: {
        root: `${ROOTS.DASHBOARD}/customer/agency`,
        new: `${ROOTS.DASHBOARD}/customer/agency/new`,
        rpt: `${ROOTS.DASHBOARD}/customer/agency/rpt`,
        edit: (AgencyID) => `${ROOTS.DASHBOARD}/customer/agency/edit/${AgencyID}`,

        // account: `${ROOTS.DASHBOARD}/customer/Agency/account`,
        // notifications: `${ROOTS.DASHBOARD}/admin/supplier-profile/notifications`,
      },

      compliance: {
        root: `${ROOTS.DASHBOARD}/customer/compliance-status`,
      },
      profile: {
        root: `${ROOTS.DASHBOARD}/customer/profile`,
        new: `${ROOTS.DASHBOARD}/customer/profile/new`,
        edit: (profileID) => `${ROOTS.DASHBOARD}/customer/profile/edit/${profileID}`,
        account: `${ROOTS.DASHBOARD}/customer/profile/account`,
        notifications: `${ROOTS.DASHBOARD}/customer/profile/notifications`,
      },
      segmentation: {
        root: `${ROOTS.DASHBOARD}/customer/segmentation`,
        list: `${ROOTS.DASHBOARD}/customer/segmentation/view`,
        new: `${ROOTS.DASHBOARD}/customer/segmentation/new`,
        edit: (segmentationID) => `${ROOTS.DASHBOARD}/customer/segmentation/edit/${segmentationID}`,
        preview: `${ROOTS.DASHBOARD}/customer/segmentation/preview`,
      },
    },

    transaction: {
      root: `${ROOTS.DASHBOARD}/transaction`,
      priceList: {
        root: `${ROOTS.DASHBOARD}/transaction/price-list`,
        new: `${ROOTS.DASHBOARD}/transaction/price-list/new`,
        edit: (priceListID) => `${ROOTS.DASHBOARD}/transaction/price-list/edit/${priceListID}`,
        newVersion: (priceListID) =>
          `${ROOTS.DASHBOARD}/transaction/price-list/new-version/${priceListID}`,
      },
      opportunity: {
        root: `${ROOTS.DASHBOARD}/transaction/opportunity`,
        list: `${ROOTS.DASHBOARD}/transaction/opportunity/view`,
        new: `${ROOTS.DASHBOARD}/transaction/opportunity/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/opportunity/edit/${opportunityID}`,
        approval: (opportunityID) =>
          `${ROOTS.DASHBOARD}/transaction/opportunity/approval/${opportunityID}`,
      },
      quotation: {
        root: `${ROOTS.DASHBOARD}/transaction/quotation`,
        list: `${ROOTS.DASHBOARD}/transaction/quotation/view`,
        new: `${ROOTS.DASHBOARD}/transaction/quotation/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/quotation/edit/${opportunityID}`,
        approval: (opportunityID) =>
          `${ROOTS.DASHBOARD}/transaction/quotation/approval/${opportunityID}`,
        pdf: (quotationID) => `${ROOTS.DASHBOARD}/transaction/quotation/pdf/${quotationID}`,
      },
      sample: {
        root: `${ROOTS.DASHBOARD}/transaction/sample`,
        list: `${ROOTS.DASHBOARD}/transaction/sample/view`,
        new: `${ROOTS.DASHBOARD}/transaction/sample/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/sample/edit/${opportunityID}`,
        pdf: (quotationID) => `${ROOTS.DASHBOARD}/transaction/sample/pdf/${quotationID}`,
      },
      pi: {
        root: `${ROOTS.DASHBOARD}/transaction/pi`,
        list: `${ROOTS.DASHBOARD}/transaction/pi/view`,
        new: `${ROOTS.DASHBOARD}/transaction/pi/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/pi/edit/${opportunityID}`,
        revision: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/pi/revision/${opportunityID}`,
        approver: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/pi/approver/${opportunityID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/transaction/pi/pdf/${piID}`,
      },
      dispoder: {
        root: `${ROOTS.DASHBOARD}/transaction/dispoder`,
        list: `${ROOTS.DASHBOARD}/transaction/dispoder/view`,
        new: `${ROOTS.DASHBOARD}/transaction/dispoder/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/dispoder/edit/${opportunityID}`,
        revision: (opportunityID) =>
          `${ROOTS.DASHBOARD}/transaction/dispoder/revision/${opportunityID}`,
        approver: (opportunityID) =>
          `${ROOTS.DASHBOARD}/transaction/dispoder/approver/${opportunityID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/transaction/dispoder/pdf/${piID}`,
      },
    },

    InventoryManagement: {
      root: `${ROOTS.DASHBOARD}/inventory-management`,
      rawMaterial: {
        root: `${ROOTS.DASHBOARD}/inventory-management/raw`,
        list: `${ROOTS.DASHBOARD}/inventory-management/raw/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/raw/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/raw/edit/${yarnID}`,
      },
      RawMaterial: {
        root: `${ROOTS.DASHBOARD}/inventory-management/rm`,
        list: `${ROOTS.DASHBOARD}/inventory-management/rm/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/rm/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/rm/edit/${yarnID}`,
      },
      ItemOpen: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemOpen`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemOpen/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemOpen/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/ItemOpen/edit/${yarnID}`,
      },
      ItemOpenDatabase: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemOpenDatabase`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemOpenDatabase/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemOpenDatabase/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/ItemOpenDatabase/edit/${yarnID}`,
      },
      ItemRecieve: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemRecieve`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemRecieve/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemRecieve/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/ItemRecieve/edit/${yarnID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/inventory-management/ItemRecieve/pdf/${GRNID}`,
      },
      ItemRequisition: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemRequisition`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemRequisition/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemRequisition/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/ItemRequisition/edit/${yarnID}`,
      },
      ItemIssue: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemIssue`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemIssue/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemIssue/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/inventory-management/ItemIssue/edit/${yarnID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/inventory-management/ItemIssue/pdf/${GRNID}`,
      },
      ItemReturnAcknowledgement: {
        root: `${ROOTS.DASHBOARD}/inventory-management/ItemReturnAcknowledgement`,
        list: `${ROOTS.DASHBOARD}/inventory-management/ItemReturnAcknowledgement/view`,
        new: `${ROOTS.DASHBOARD}/inventory-management/ItemReturnAcknowledgement/new`,
        edit: (yarnID) =>
          `${ROOTS.DASHBOARD}/inventory-management/ItemReturnAcknowledgement/edit/${yarnID}`,
        pdf: (GRNID, ItemOpenID) =>
          `${ROOTS.DASHBOARD}/inventory-management/ItemReturnAcknowledgement/pdf/${GRNID}/${ItemOpenID}`,
      },
      // WasteVoucher: {
      //   root: `${ROOTS.DASHBOARD}/inventory-management/WasteVoucher`,
      //   new: `${ROOTS.DASHBOARD}/inventory-management/WasteVoucher/new`,
      //   pdf: (Voucher_ID) =>
      //     `${ROOTS.DASHBOARD}/inventory-management/WasteVoucher/pdf/${Voucher_ID}`,
      //   edit: (VID) => `${ROOTS.DASHBOARD}/inventory-management/WasteVoucher/edit/${VID}`,
      // },
      // TransferVoucher: {
      //   root: `${ROOTS.DASHBOARD}/inventory-management/TransferVoucher`,
      //   new: `${ROOTS.DASHBOARD}/inventory-management/TransferVoucher/new`,
      //   pdf: (TransferMstID) =>
      //     `${ROOTS.DASHBOARD}/inventory-management/TransferVoucher/pdf/${TransferMstID}`,
      //   edit: (TransferMstID) =>
      //     `${ROOTS.DASHBOARD}/inventory-management/TransferVoucher/edit/${TransferMstID}`,
      // },
    },

    procurement: {
      root: `${ROOTS.DASHBOARD}/procurement`,
      pr: {
        root: `${ROOTS.DASHBOARD}/procurement/pr`,
        list: `${ROOTS.DASHBOARD}/procurement/pr/view`,
        new: `${ROOTS.DASHBOARD}/procurement/pr/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/procurement/pr/edit/${yarnID}`,
        approval: (yarnID) => `${ROOTS.DASHBOARD}/procurement/pr/approval/${yarnID}`,
        pdf: (yarnID) => `${ROOTS.DASHBOARD}/procurement/pr/pdf/${yarnID}`,
      },
      po: {
        root: `${ROOTS.DASHBOARD}/procurement/po`,
        list: `${ROOTS.DASHBOARD}/procurement/po/view`,
        new: `${ROOTS.DASHBOARD}/procurement/po/new`,
        edit: (yarnID) => `${ROOTS.DASHBOARD}/procurement/po/edit/${yarnID}`,
        approval: (yarnID) => `${ROOTS.DASHBOARD}/procurement/po/approval/${yarnID}`,
        pdf: (yarnID) => `${ROOTS.DASHBOARD}/procurement/po/pdf/${yarnID}`,
      },
    },

    customerClaim: {
      root: `${ROOTS.DASHBOARD}/customer-claim`,
      list: `${ROOTS.DASHBOARD}/customer-claim/list`,
      claimForm: `${ROOTS.DASHBOARD}/customer-claim/claim-form`,
      dispoder: {
        root: `${ROOTS.DASHBOARD}/customer-claim/dispoder`,
        list: `${ROOTS.DASHBOARD}/customer-claim/dispoder/view`,
        new: `${ROOTS.DASHBOARD}/customer-claim/dispoder/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/customer-claim/dispoder/edit/${opportunityID}`,
        revision: (opportunityID) =>
          `${ROOTS.DASHBOARD}/customer-claim/dispoder/revision/${opportunityID}`,
        approver: (opportunityID) =>
          `${ROOTS.DASHBOARD}/customer-claim/dispoder/approver/${opportunityID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/customer-claim/dispoder/pdf/${piID}`,
      },
      monitor: {
        root: `${ROOTS.DASHBOARD}/customer-claim/monitor`,
        list: `${ROOTS.DASHBOARD}/customer-claim/monitor/view`,
        new: `${ROOTS.DASHBOARD}/customer-claim/monitor/new`,
        edit: (opportunityID) => `${ROOTS.DASHBOARD}/customer-claim/monitor/edit/${opportunityID}`,
        revision: (opportunityID) =>
          `${ROOTS.DASHBOARD}/customer-claim/monitor/revision/${opportunityID}`,
        approver: (opportunityID) =>
          `${ROOTS.DASHBOARD}/customer-claim/monitor/approver/${opportunityID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/customer-claim/monitor/pdf/${piID}`,
      },
      // investigation: {
      //   root: `${ROOTS.DASHBOARD}/customer-claim/investigation`,
      //   page500: `${ROOTS.DASHBOARD}/customer-claim/investigation/page500`,
      //   list: `${ROOTS.DASHBOARD}/customer-claim/investigation/view`,
      //   new: `${ROOTS.DASHBOARD}/customer-claim/investigation/new`,
      //   edit: (opportunityID) =>
      //     `${ROOTS.DASHBOARD}/customer-claim/investigation/edit/${opportunityID}`,
      //   revision: (opportunityID) =>
      //     `${ROOTS.DASHBOARD}/customer-claim/investigation/revision/${opportunityID}`,
      //   approver: (opportunityID) =>
      //     `${ROOTS.DASHBOARD}/customer-claim/investigation/approver/${opportunityID}`,
      //   pdf: (piID) => `${ROOTS.DASHBOARD}/customer-claim/investigation/pdf/${piID}`,
      // },
      claimAudits: {
        root: `${ROOTS.DASHBOARD}/customer-claim/claim`,
        list: `${ROOTS.DASHBOARD}/customer-claim/claim/list`,
        settlement: (CustomerID, AuditID) =>
          `${ROOTS.DASHBOARD}/customer-claim/claim/settlement/${CustomerID}/${AuditID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/customer-claim/claim/pdf/${piID}`,
      },
    },

    rdLab: {
      root: `${ROOTS.DASHBOARD}/rd-lab`,
      recipe: {
        root: `${ROOTS.DASHBOARD}/rd-lab/recipe`,
        new: `${ROOTS.DASHBOARD}/rd-lab/recipe/new`,
        edit: (recipeID) => `${ROOTS.DASHBOARD}/rd-lab/recipe/edit/${recipeID}`,
      },
    },

    Production: {
      root: `${ROOTS.DASHBOARD}/production`,
      ProductRequest: {
        root: `${ROOTS.DASHBOARD}/production/ProductRequest`,
        new: `${ROOTS.DASHBOARD}/production/ProductRequest/new`,
        edit: (piID) => `${ROOTS.DASHBOARD}/production/ProductRequest/edit/${piID}`,
        pdf: (piID) => `${ROOTS.DASHBOARD}/production/ProductRequest/pdf/${piID}`,
      },
      GoodsRecievedConfirmation: {
        root: `${ROOTS.DASHBOARD}/production/GoodsRecievedConfirmation`,
        new: `${ROOTS.DASHBOARD}/production/GoodsRecievedConfirmation/new`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/GoodsRecievedConfirmation/pdf/${GRNID}`,
        edit: (GRNID) => `${ROOTS.DASHBOARD}/production/GoodsRecievedConfirmation/edit/${GRNID}`,
      },
      ProductionReport: {
        root: `${ROOTS.DASHBOARD}/production/ProductionReport`,
        new: `${ROOTS.DASHBOARD}/production/ProductionReport/new`,
        edit: (ReportID) => `${ROOTS.DASHBOARD}/production/ProductionReport/edit/${ReportID}`,
        pdf: (ReportID) => `${ROOTS.DASHBOARD}/production/ProductionReport/pdf/${ReportID}`,
      },
      ProductVoucher: {
        root: `${ROOTS.DASHBOARD}/production/ProductVoucher`,
        new: `${ROOTS.DASHBOARD}/production/ProductVoucher/new`,
        // edit: (colorID) => `${ROOTS.DASHBOARD}/product-management/ProductReport/edit/${colorID}`,
      },
      TransferPIVoucher: {
        root: `${ROOTS.DASHBOARD}/production/TransferPIVoucher`,
        new: `${ROOTS.DASHBOARD}/production/TransferPIVoucher/new`,
        // edit: (colorID) => `${ROOTS.DASHBOARD}/product-management/ProductReport/edit/${colorID}`,
      },
      RTReport: {
        root: `${ROOTS.DASHBOARD}/production/RTReport`,
        new: `${ROOTS.DASHBOARD}/production/RTReport/new`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/RTReport/pdf/${GRNID}`,
      },
      BlowReport: {
        root: `${ROOTS.DASHBOARD}/production/BlowReport`,
        new: `${ROOTS.DASHBOARD}/production/BlowReport/new`,
        edit: (GRNID) => `${ROOTS.DASHBOARD}/production/BlowReport/edit/${GRNID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/BlowReport/pdf/${GRNID}`,
      },
      CardReport: {
        root: `${ROOTS.DASHBOARD}/production/CardReport`,
        new: `${ROOTS.DASHBOARD}/production/CardReport/new`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/CardReport/pdf/${GRNID}`,
        edit: (ReportID) => `${ROOTS.DASHBOARD}/production/CardReport/edit/${ReportID}`,
      },
      DrawReport: {
        root: `${ROOTS.DASHBOARD}/production/DrawReport`,
        new: `${ROOTS.DASHBOARD}/production/DrawReport/new`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/DrawReport/pdf/${GRNID}`,
      },
      maintenance: {
        root: `${ROOTS.DASHBOARD}/production/maintenance`,
        schedule: {
          root: `${ROOTS.DASHBOARD}/production/maintenance/schedule`,
          new: `${ROOTS.DASHBOARD}/production/maintenance/schedule/new`,
          edit: (scheduleID) =>
            `${ROOTS.DASHBOARD}/production/maintenance/schedule/edit/${scheduleID}`,
          pdf: (scheduleID) =>
            `${ROOTS.DASHBOARD}/production/maintenance/schedule/pdf/${scheduleID}`,
        },
        new: `${ROOTS.DASHBOARD}/production/maintenance/new`,
        edit: (GRNID) => `${ROOTS.DASHBOARD}/production/maintenance/edit/${GRNID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/production/maintenance/pdf/${GRNID}`,
        MCheckList: {
          root: `${ROOTS.DASHBOARD}/production/maintenance/MCheckList`,
          new: `${ROOTS.DASHBOARD}/production/maintenance/MCheckList/new`,
          pdf: (ReportID) => `${ROOTS.DASHBOARD}/production/maintenance/MCheckList/pdf/${ReportID}`,
          // edit: (colorID) => `${ROOTS.DASHBOARD}/product-management/ProductReport/edit/${colorID}`,
        },
      },

      WasteVoucher: {
        root: `${ROOTS.DASHBOARD}/production/WasteVoucher`,
        new: `${ROOTS.DASHBOARD}/production/WasteVoucher/new`,
        pdf: (Voucher_ID) => `${ROOTS.DASHBOARD}/production/WasteVoucher/pdf/${Voucher_ID}`,
        edit: (VID) => `${ROOTS.DASHBOARD}/production/WasteVoucher/edit/${VID}`,
      },
      TransferVoucher: {
        root: `${ROOTS.DASHBOARD}/production/TransferVoucher`,
        new: `${ROOTS.DASHBOARD}/production/TransferVoucher/new`,
        pdf: (TransferMstID) =>
          `${ROOTS.DASHBOARD}/production/TransferVoucher/pdf/${TransferMstID}`,
        edit: (TransferMstID) =>
          `${ROOTS.DASHBOARD}/production/TransferVoucher/edit/${TransferMstID}`,
      },

      Planning: {
        root: `${ROOTS.DASHBOARD}/production/Planning`,
        ProductionMiddleware: {
          root: `${ROOTS.DASHBOARD}/production/Planning/productionMiddleware`,
          list: `${ROOTS.DASHBOARD}/production/Planning/productionMiddleware/view`,
          new: `${ROOTS.DASHBOARD}/production/Planning/productionMiddleware/new`,
          edit: (ProductionMiddlewareID) =>
            `${ROOTS.DASHBOARD}/production/Planning/productionMiddleware/edit/${ProductionMiddlewareID}`,
          pdf: (ProductionMiddlewareID) =>
            `${ROOTS.DASHBOARD}/production/Planning/productionMiddleware/pdf/${ProductionMiddlewareID}`,
        },
        ProductionBucket: {
          root: `${ROOTS.DASHBOARD}/production/Planning/ProductionBucket`,
          list: `${ROOTS.DASHBOARD}/production/Planning/ProductionBucket/view`,
          new: `${ROOTS.DASHBOARD}/production/Planning/ProductionBucket/new`,
          edit: (ProductionBucketID) =>
            `${ROOTS.DASHBOARD}/production/Planning/ProductionBucket/edit/${ProductionBucketID}`,
          pdf: (ProductionBucketID) =>
            `${ROOTS.DASHBOARD}/production/Planning/ProductionBucket/pdf/${ProductionBucketID}`,
        },
        production: {
          root: `${ROOTS.DASHBOARD}/production/Planning/production`,
          new: `${ROOTS.DASHBOARD}/production/Planning/production/new`,
          edit: (productID) =>
            `${ROOTS.DASHBOARD}/production/Planning/production/edit/${productID}`,
        },
      },
    },

    Commercial: {
      root: `${ROOTS.DASHBOARD}/commercial`,
      export: {
        root: `${ROOTS.DASHBOARD}/commercial/exp`,
        ExportInvoice: {
          root: `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice`,
          list: `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice/view`,
          new: `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice/new`,
          edit: (ExportInvoiceID) =>
            `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice/edit/${ExportInvoiceID}`,
          add: (opportunityID) =>
            `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice/add/${opportunityID}`,
          // revision: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/ExportInvoice/revision/${opportunityID}`,
          // approver: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/ExportInvoice/approver/${opportunityID}`,
          pdf: (ExportInvoiceID) =>
            `${ROOTS.DASHBOARD}/commercial/exp/ExportInvoice/pdf/${ExportInvoiceID}`,
        },
        ExportLC: {
          root: `${ROOTS.DASHBOARD}/commercial/exp/Export`,
          list: `${ROOTS.DASHBOARD}/commercial/exp/Export/view`,
          new: `${ROOTS.DASHBOARD}/commercial/exp/Export/new`,
          edit: (ExID) => `${ROOTS.DASHBOARD}/commercial/exp/Export/edit/${ExID}`,
          view: (ExID) => `${ROOTS.DASHBOARD}/commercial/exp/Export/view/${ExID}`,
          // revision: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/Export/revision/${opportunityID}`,
          // approver: (opportunityID) => `${ROOTS.DASHBOARD}/transaction/Export/approver/${opportunityID}`,
          pdf: (piID) => `${ROOTS.DASHBOARD}/commercial/exp/Export/pdf/${piID}`,
          amendment: (ExID) => `${ROOTS.DASHBOARD}/commercial/exp/Export/amendment/${ExID}`,
        },

        DocumentSubmission: {
          root: `${ROOTS.DASHBOARD}/commercial/exp/documentsubmission`,
          list: `${ROOTS.DASHBOARD}/commercial/exp/documentsubmission/list`,
          new: `${ROOTS.DASHBOARD}/commercial/exp/documentsubmission/new`,
          edit: (DocID) => `${ROOTS.DASHBOARD}/commercial/exp/documentsubmission/edit/${DocID}`,
          pdf: (SubmissionID) =>
            `${ROOTS.DASHBOARD}/commercial/exp/documentsubmission/pdf/${SubmissionID}`,
        },
        DocumentRealization: {
          root: `${ROOTS.DASHBOARD}/commercial/exp/docRealization`,
          list: `${ROOTS.DASHBOARD}/commercial/exp/docRealization/list`,
          new: `${ROOTS.DASHBOARD}/commercial/exp/docRealization/new`,
          edit: (DocID) => `${ROOTS.DASHBOARD}/commercial/exp/docRealization/edit/${DocID}`,
          // pdf: (SubmissionID) => `${ROOTS.DASHBOARD}/commercial/documentrealization/pdf/${SubmissionID}`,
        },
      },
      import: {
        root: `${ROOTS.DASHBOARD}/commercial/import`,
        ImportPIRegister: {
          root: `${ROOTS.DASHBOARD}/commercial/import/ImportPIRegister`,
          list: `${ROOTS.DASHBOARD}/commercial/import/ImportPIRegister/list`,
          new: `${ROOTS.DASHBOARD}/commercial/import/ImportPIRegister/new`,
          edit: (ImportPIRegisterID) =>
            `${ROOTS.DASHBOARD}/commercial/import/ImportPIRegister/edit/${ImportPIRegisterID}`,
        },
        ImportLCInfo: {
          root: `${ROOTS.DASHBOARD}/commercial/import/ImportLCInfo`,
          list: `${ROOTS.DASHBOARD}/commercial/import/ImportLCInfo/list`,
          new: `${ROOTS.DASHBOARD}/commercial/import/ImportLCInfo/new`,
          edit: (ImportLCID) =>
            `${ROOTS.DASHBOARD}/commercial/import/ImportLCInfo/edit/${ImportLCID}`,
        },
        ImportInvoiceEntry: {
          root: `${ROOTS.DASHBOARD}/commercial/import/ImportInvoiceEntry`,
          list: `${ROOTS.DASHBOARD}/commercial/import/ImportInvoiceEntry/list`,
          new: `${ROOTS.DASHBOARD}/commercial/import/ImportInvoiceEntry/new`,
          edit: (ImportInvoiceEntryID) =>
            `${ROOTS.DASHBOARD}/commercial/import/ImportInvoiceEntry/edit/${ImportInvoiceEntryID}`,
        },
        ImportLCBillPayment: {
          root: `${ROOTS.DASHBOARD}/commercial/import/ImportLCBillPayment`,
          list: `${ROOTS.DASHBOARD}/commercial/import/ImportLCBillPayment/list`,
          new: `${ROOTS.DASHBOARD}/commercial/import/ImportLCBillPayment/new`,
          edit: (ImportLCBillPaymentID) =>
            `${ROOTS.DASHBOARD}/commercial/import/ImportLCBillPayment/edit/${ImportLCBillPaymentID}`,
        },
      },
    },

    AIPlans: {
      root: `${ROOTS.DASHBOARD}/AIPlans`,
      create: `${ROOTS.DASHBOARD}/AIPlans/create`,
      CostingPlan: {
        root: `${ROOTS.DASHBOARD}/AIPlans/CostingPlan`,
        new: `${ROOTS.DASHBOARD}/AIPlans/CostingPlan/new`,
        pdf: (Voucher_ID) => `${ROOTS.DASHBOARD}/AIPlans/CostingPlan/pdf/${Voucher_ID}`,
        edit: (CostingPlanID) => `${ROOTS.DASHBOARD}/AIPlans/CostingPlan/edit/${CostingPlanID}`,
        // edit: (colorID) => `${ROOTS.DASHBOARD}/product-management/ProductReport/edit/${colorID}`,
      },
    },
  },
};

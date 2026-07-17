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

  // supplierPublicOnboarding: '/supplier-onboarding',


  supplierPublicOnboarding: (vendorID, otp, expiry, companyID) =>
    `/supplier-onboarding?vendorID=${vendorID}&otp=${otp}&expiry=${expiry}&companyID=${companyID}`,
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


    Onboarding: {
      root: `${ROOTS.DASHBOARD}/onboarding`,
      Supplier: {
        root: `${ROOTS.DASHBOARD}/onboarding/suppliers`,
        new: `${ROOTS.DASHBOARD}/onboarding/suppliers/new`,
        edit: (GRNID) => `${ROOTS.DASHBOARD}/onboarding/suppliers/edit/${GRNID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/onboarding/suppliers/pdf/${GRNID}`,
      },
    },

    CompanyDatabase: {
      root: `${ROOTS.DASHBOARD}/company-database`,
      new: `${ROOTS.DASHBOARD}/company-database/new`,
    },

    Regulations: {
      root: `${ROOTS.DASHBOARD}/regulations`,
      new: `${ROOTS.DASHBOARD}/regulations/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/regulations/edit/${id}`,
    },
    Powertool: {
      root: `${ROOTS.DASHBOARD}/powertool`,
      Customer: {
        root: `${ROOTS.DASHBOARD}/powertool/customers`,
        new: `${ROOTS.DASHBOARD}/powertool/customers/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/customers/edit/${id}`,
        view: (id) => `${ROOTS.DASHBOARD}/powertool/customers/view/${id}`,
      },
      Office: {
        root: `${ROOTS.DASHBOARD}/powertool/offices`,
        new: `${ROOTS.DASHBOARD}/powertool/offices/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/offices/edit/${id}`,
      },
      Factory: {
        root: `${ROOTS.DASHBOARD}/powertool/factories`,
        new: `${ROOTS.DASHBOARD}/powertool/factories/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/factories/edit/${id}`,
      },
      TransactionType: {
        root: `${ROOTS.DASHBOARD}/powertool/transaction-types`,
        new: `${ROOTS.DASHBOARD}/powertool/transaction-types/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/transaction-types/edit/${id}`,
      },
      PaymentTerm: {
        root: `${ROOTS.DASHBOARD}/powertool/payment-terms`,
        new: `${ROOTS.DASHBOARD}/powertool/payment-terms/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/payment-terms/edit/${id}`,
      },
      PaymentMode: {
        root: `${ROOTS.DASHBOARD}/powertool/payment-modes`,
        new: `${ROOTS.DASHBOARD}/powertool/payment-modes/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/payment-modes/edit/${id}`,
      },
      Incoterm: {
        root: `${ROOTS.DASHBOARD}/powertool/incoterms`,
        new: `${ROOTS.DASHBOARD}/powertool/incoterms/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/incoterms/edit/${id}`,
      },
      TransportMode: {
        root: `${ROOTS.DASHBOARD}/powertool/transport-modes`,
        new: `${ROOTS.DASHBOARD}/powertool/transport-modes/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/transport-modes/edit/${id}`,
      },
      Composition: {
        root: `${ROOTS.DASHBOARD}/powertool/composition`,
        new: `${ROOTS.DASHBOARD}/powertool/composition/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/composition/edit/${id}`,
      },
      BuyingDepartment: {
        root: `${ROOTS.DASHBOARD}/powertool/buying-departments`,
        new: `${ROOTS.DASHBOARD}/powertool/buying-departments/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/powertool/buying-departments/edit/${id}`,
      },
    },
    Settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
    },
  },
};

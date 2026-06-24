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


    Onboarding: {
      root: `${ROOTS.DASHBOARD}/onboarding`,
      Supplier: {
        root: `${ROOTS.DASHBOARD}/onboarding/suppliers`,
        new: `${ROOTS.DASHBOARD}/onboarding/suppliers/new`,
        edit: (GRNID) => `${ROOTS.DASHBOARD}/onboarding/suppliers/edit/${GRNID}`,
        pdf: (GRNID) => `${ROOTS.DASHBOARD}/onboarding/suppliers/pdf/${GRNID}`,
      },
    },

  },
};

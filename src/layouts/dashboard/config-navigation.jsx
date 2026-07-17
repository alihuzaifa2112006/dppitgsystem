import { useMemo } from 'react';
import Iconify from 'src/components/iconify';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const modernDashboardIcon = <Iconify icon="solar:widget-5-bold-duotone" width={1} height={1} />;

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
  dashboard: modernDashboardIcon,
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

  // LocalStorage se data lein
  const userData = useMemo(() => {
    try {
      const data = localStorage.getItem('UserData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing UserData:', error);
      return null;
    }
  }, []);

  // Company data extract karein
  const companyData = userData?.Data?.company || {};
  const mainType = companyData?.MainType || ''; // 'C' ya 'S'

  // Check karein ke user Company hai ya Supplier
  const isCompany = mainType === 'C';
  const isSupplier = mainType === 'S';

  const data = useMemo(() => {
    // Base navigation - Dashboard sabko dikhega
    const navItems = [
      {
        items: [
          {
            title: t('Dashboard'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
        ],
      },
    ];

    // Company ke liye: Sab kuch dikhao
    if (isCompany) {
      navItems.push({
        items: [
          {
            title: t('Company Profile'),
            path: paths.dashboard.CompanyDatabase.new,
            icon: ICONS.database,
          },
        ],
      });

      navItems.push({
        items: [
          {
            title: t('Powertool'),
            path: paths.dashboard.Powertool.Customer.root,
            icon: ICONS.management,
            children: [
              {
                title: t('Customer'),
                path: paths.dashboard.Powertool.Customer.root,
              },
              {
                title: t('Offices'),
                path: paths.dashboard.Powertool.Office.root,
              },
              {
                title: t('Factories'),
                path: paths.dashboard.Powertool.Factory.root,
              },
              {
                title: t('Transaction Types'),
                path: paths.dashboard.Powertool.TransactionType.root,
              },
              {
                title: t('Payment Terms'),
                path: paths.dashboard.Powertool.PaymentTerm.root,
              },
              {
                title: t('Payment Modes'),
                path: paths.dashboard.Powertool.PaymentMode.root,
              },
              {
                title: t('Incoterms'),
                path: paths.dashboard.Powertool.Incoterm.root,
              },
              {
                title: t('Transport Modes'),
                path: paths.dashboard.Powertool.TransportMode.root,
              },
              {
                title: t('Composition'),
                path: paths.dashboard.Powertool.Composition.root,
              },
              {
                title: t('Buying Departments'),
                path: paths.dashboard.Powertool.BuyingDepartment.root,
              },
            ],
          },
        ],
      });

      navItems.push({
        items: [
          {
            title: t('Supply Chain Network'),
            path: paths.dashboard.Onboarding.Supplier.root,
            icon: ICONS.management,
          },
          {
            title: t('Regulations'),
            path: paths.dashboard.Regulations.root,
            icon: ICONS.file,
          },
        ],
      });
    }

    // Supplier ke liye: Sirf Dashboard, Supply Chain Network, Regulations
    if (isSupplier) {
      navItems.push({
        items: [
          {
            title: t('Supply Chain Network'),
            path: paths.dashboard.Onboarding.Supplier.root,
            icon: ICONS.management,
          },
          {
            title: t('Regulations'),
            path: paths.dashboard.Regulations.root,
            icon: ICONS.file,
          },
        ],
      });
    }

    // Sabke liye (Everyone)
    navItems.push({
      items: [
        {
          title: t('Settings'),
          path: paths.dashboard.Settings.root,
          icon: ICONS.settings,
        }
      ]
    });

    return navItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, isCompany, isSupplier]);

  return data;
}
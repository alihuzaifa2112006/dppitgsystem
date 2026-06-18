import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

import useGetAllClausesByDocTypeID from 'src/utils/getClauses';


import ExportEditFormMain from '../elc-main-edit';

// ----------------------------------------------------------------------

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export default function ExportEditViewMain({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
 

  const [currentData, setCurrentData] = useState(null);
  const [clauses, setClauses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
    
      
      const response = await Get(
        `CommercialModule/GetLCDetailsByLCID?ExportLCID=${urlData?.ExID}`
      );
      
      if (response.data.Success) {
        const lcData = response.data.Data;
        const lcHeader = lcData.LCHeader;
        const piDetails = lcData.PIDetails;

        const formatedData = {
          ...lcHeader,
          ExportLCNo: lcHeader.ExportLCNo,
          FileRef: lcHeader.FileRef,
          CentralBankReportingNo: lcHeader.CentralBankReportingNo,
          LCDate: new Date(lcHeader.LCDate),
          LienDate: new Date(lcHeader.LienDate),
          ExpiryDate: new Date(lcHeader.ExpiryDate),
          ShipDate: new Date(lcHeader.ShipDate),
          
          // Customer/Beneficiary information
          Customer: {
            WIC_ID: lcHeader.WIC_ID,
            WIC_Name: piDetails[0]?.WIC_Name || '',
          },
          Beneficiary: {
            BeneficiaryID: lcHeader.BeneficiaryID,
          },
          OpeningBank: {
            OpeningBankID: lcHeader.OpeningBankID,
          },
          LienBank: {
            LienBankID: lcHeader.LienBankID,
          },
          ReceiveThroughBank: {
            ReceiveThroughBankID: lcHeader.ReceiveThroughBankID,
          },
          LCNature: {
            LCNatureID: lcHeader.LCNatureID,
          },
          Incoterm: {
            IncotermID: lcHeader.IncotermID,
          },
          PayTerm: {
            PayTermID: lcHeader.PayTermID,
          },
          Currency: {
            CurrencyID: lcHeader.CurrencyID,
          },
          LCPurpose: {
            LCPurposeID: lcHeader.LCPurposeID,
          },
          Port: {
            PortID: lcHeader.PortID,
          },

          // PI Details mapping
          Details: piDetails.map((item) => ({
            ...item,
            Unit_Price: item.UnitPrice,
            Total_Amount: item.Total_Amount,
            Product: {
              Product_ID: item.PIDtlID, // Using PIDtlID as Product_ID since it's not available in response
              Product_Name: item.ProductDescription,
              UOMName: item.UOMName,
              CurrencyID: lcHeader.CurrencyID,
            },
            Fabric_Type: {
              Fabric_TypeID: item.FabricTypeID,
              Fabric_Type: item.FabricTypeID, // You might want to map this to actual fabric type name
            },
            Sustainability: {
              Sustainability_ID: item.SustainabilityID,
              Sustainability_Name: item.SustainabilityID, // You might want to map this to actual sustainability name
            },
            PriceListID: {
              PriceListID: item.PriceList_ID,
              PriceListName: item.PriceList_ID, // You might want to map this to actual price list name
            },
            // Additional fields that might be needed
            Composition: {
              CompositionID: item.CompositionID,
            },
            YarnType: {
              YarnTypeID: item.YarnTypeID,
            },
            Color: {
              ColorID: item.ColorID,
            },
            Count: {
              CountID: item.CountID,
            },
            UOM: {
              UOMID: item.UOMID,
            },
            DeliveryDueDate: new Date(item.DeliveryDueDate),
          })),

          // Remarks from PI Details
          Remarks: piDetails.map((item) => ({
            PIDtlID: item.PIDtlID,
            Remarks: item.Remarks
          })),

          // Amendments if any
          Amendments: lcHeader.Amendments || [],
        };

        console.log('formatedData', formatedData);
        setCurrentData(formatedData);
      }
    };

    if (urlData?.ExID) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit L/C Tagging"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Edit L/C Tagging',
            href: paths.dashboard.Commercial.export.ExportLC.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ExportEditFormMain currentData={currentData} clauses={clauses} />
    </Container>
  );
}

ExportEditViewMain.propTypes = {
  urlData: PropTypes.any,
};
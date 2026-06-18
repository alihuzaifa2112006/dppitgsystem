import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

import ExportInvoiceEditForm from '../ExportInvoice-edit';

// ----------------------------------------------------------------------

export default function ExportInvoiceEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
 
  const [currentData, setCurrentData] = useState(null);
  const [clauses, setClauses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `CommercialModule/GetExportInvoiceByID?ExportInvoiceID=${urlData?.ExportInvoiceID}`
      );
      
      if (response.data.Success && response.data.Data.length > 0) {
        const invoiceData = response.data.Data[0];
        
        const formatedData = {
          // Basic Information
          ExportInvoiceID: Number(invoiceData.ExportInvoiceID),
          InvoiceTypeID: Number(invoiceData.InvoiceTypeID),
          ExportInvoiceNo: invoiceData.ExportInvoiceNo,
          ExportInvoiceDate: new Date(invoiceData.ExportInvoiceDate),
          InvoicePurposeID: Number(invoiceData.InvoicePurposeID),
          ExportLCID: Number(invoiceData.ExportLCID),
          
          // Financial Information
          GoodsValue: parseFloat(invoiceData.GoodsValue) || 0,
          Commission: parseFloat(invoiceData.Commission) || 0,
          AdjustmentAmount: parseFloat(invoiceData.AdjustmentAmount) || 0,
          ExportInvoiceValue: parseFloat(invoiceData.ExportInvoiceValue) || 0,
          ExchangeRate: parseFloat(invoiceData.ExchangeRate) || 0,
          InvoiceValueInTK: parseFloat(invoiceData.InvoiceValueInTK) || 0,
          Freight: parseFloat(invoiceData.Freight) || 0,
          
          // Quantity and Units
          InvoiceQty: parseFloat(invoiceData.InvoiceQty) || 0,
          UOMID: invoiceData.UOMID,
          TotalInvoiceQty: parseFloat(invoiceData.TotalInvoiceQty) || 0,
          TotalShippedQty: parseFloat(invoiceData.TotalShippedQty) || 0,
          DeliveryQty: invoiceData.DeliveryQty ? parseFloat(invoiceData.DeliveryQty) : 0,
          BagQty: invoiceData.BagQty ? parseFloat(invoiceData.BagQty) : 0,
          CartonQty: parseInt(invoiceData.CartonQty,10) || 0,
          
          // Shipping and Logistics
          IncotermID:Number(invoiceData.IncotermID),
          ShipmentModeID: Number(invoiceData.ShipmentModeID),
          PurposeID: Number(invoiceData.PurposeID),
          CINatureID: Number(invoiceData.CINatureID),
          ShippingLineID: Number(invoiceData.ShippingLineID),
          BLNo: invoiceData.BLNo,
          BLDate: invoiceData.BLDate ? new Date(invoiceData.BLDate) : null,
          FeederVessel: invoiceData.FeederVessel,
          MotherVessel: invoiceData.MotherVessel,
          ETD_POL: invoiceData.ETD_POL ? new Date(invoiceData.ETD_POL) : null,
          ETA_POD: invoiceData.ETA_POD ? new Date(invoiceData.ETA_POD) : null,
          DistributionCountryID: Number(invoiceData.DistributionCountryID),
          PortOfLoadingID: Number(invoiceData.PortOfLoadingID),
          PortOfDischargeID: Number(invoiceData.PortOfDischargeID),
          PortOfEntryID: Number(invoiceData.PortOfEntryID),
          CountryOfOriginID: Number(invoiceData.CountryOfOriginID),
          
          // Dates
          DocSenttomarketingdate: invoiceData.DocSenttomarketingdate ? new Date(invoiceData.DocSenttomarketingdate) : null,
          DocSentForBuyerAcceptance: invoiceData.DocSentForBuyerAcceptance ? new Date(invoiceData.DocSentForBuyerAcceptance) : null,
          BuyerAcceptanceDate: invoiceData.BuyerAcceptanceDate ? new Date(invoiceData.BuyerAcceptanceDate) : null,
          MaturityDate: invoiceData.MaturityDate ? new Date(invoiceData.MaturityDate) : null,
          ExFactoryDate: invoiceData.ExFactoryDate ? new Date(invoiceData.ExFactoryDate) : null,
          OnBoardDate: invoiceData.OnBoardDate ? new Date(invoiceData.OnBoardDate) : null,
          PaymentDueDate: invoiceData.PaymentDueDate ? new Date(invoiceData.PaymentDueDate) : null,
          ChallanDate: invoiceData.ChallanDate ? new Date(invoiceData.ChallanDate) : null,
          DateSubmittedToBank: invoiceData.DateSubmittedToBank ? new Date(invoiceData.DateSubmittedToBank) : null,
          DocHODate: invoiceData.DocHODate ? new Date(invoiceData.DocHODate) : null,
          FCRDate: invoiceData.FCRDate ? new Date(invoiceData.FCRDate) : null,
          ExpDate: invoiceData.ExpDate ? new Date(invoiceData.ExpDate) : null,
          ShippingBillDate: invoiceData.ShippingBillDate ? new Date(invoiceData.ShippingBillDate) : null,
          UDEPDate: invoiceData.UDEPDate ? new Date(invoiceData.UDEPDate) : null,
          
          // Parties and Agents
          CommissionAgentID: Number(invoiceData.CommissionAgentID),
          ForwardingAgentID: Number(invoiceData.ForwardingAgentID),
          ForeignAgentID: Number(invoiceData.ForeignAgentID),
          TransportAgentID: Number(invoiceData.TransportAgentID),
          Consignee_Additional: invoiceData.Consignee_Additional,
          NotifyingParty: invoiceData.NotifyingParty,
          
          // Documents and References
          MemorandumNo: invoiceData.MemorandumNo,
          ChallanNo: invoiceData.ChallanNo,
          ContractNo: invoiceData.ContractNo,
          HSCode: invoiceData.HSCode,
          FCRNumber: invoiceData.FCRNumber,
          ExpNumber: invoiceData.ExpNumber,
          ShippingBillNo: invoiceData.ShippingBillNo,
          UDEPNumber: invoiceData.UDEPNumber,
          Reference: invoiceData.Reference,
          DocSubmittedToBank: invoiceData.DocSubmittedToBank,
          // Physical Details
          NoOfContainers: invoiceData.NoOfContainers,
          ContainerNos: invoiceData.ContainerNos,
          ContainerSealNos: invoiceData.ContainerSealNos,
          NoOfTrucks: invoiceData.NoOfTrucks,
          GrossWeight: parseFloat(invoiceData.GrossWeight) || 0,
          NetWeight: parseFloat(invoiceData.NetWeight) || 0,
          FlightDetails: invoiceData.FlightDetails,
          PortOfDischarge: invoiceData.PortOfDischarge,
          // Description and Remarks
          Description: invoiceData.Description,
          Remarks: invoiceData.Remarks,
          
          // Flags and Status
          IsCollection: invoiceData.IsCollection === 'True',
          IsForced: invoiceData.IsForced === 'True',
          
          // Commission Details
          CommissionPercent: parseFloat(invoiceData.CommissionPercent) || 0,
          CMPercent: parseFloat(invoiceData.CMPercent) || 0,
          
          // System Information
          CreatedDate: new Date(invoiceData.CreatedDate),
          CreatedBy: invoiceData.CreatedBy,
          Org_ID: invoiceData.Org_ID,
          Branch_ID: invoiceData.Branch_ID,
          
          // Object mappings for dropdowns (you may need to fetch additional data for these)
          InvoiceType: {
            InvoiceTypeID: Number(invoiceData.InvoiceTypeID)
          },
          InvoicePurpose: {
            InvoicePurposeID: invoiceData.InvoicePurposeID
          },
          Incoterm: {
            IncotermID: invoiceData.IncotermID
          },
          ShipmentMode: {
            ShipmentModeID: invoiceData.ShipmentModeID
          },
          Purpose: {
            PurposeID: invoiceData.PurposeID
          },
          CINature: {
            CINatureID: invoiceData.CINatureID
          },
          UOM: {
            UOMID: invoiceData.UOMID
          },
          DistributionCountry: {
            CountryID: invoiceData.DistributionCountryID
          },
          PortOfLoading: {
            PortID: invoiceData.PortOfLoadingID
          },
          // PortOfDischarge: {
          //   PortID: invoiceData.PortOfDischargeID
          // },
          CountryOfOrigin: {
            CountryID: invoiceData.CountryOfOriginID
          }
        };

        console.log('formatedData', formatedData);
        setCurrentData(formatedData);
      }
    };

    if (urlData?.ExportInvoiceID) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Export Invoice Edit"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Export Invoice Edit',
            href: paths.dashboard.Commercial.export.ExportInvoice.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ExportInvoiceEditForm currentData={currentData}  />
    </Container>
  );
}

ExportInvoiceEditView.propTypes = {
  urlData: PropTypes.any,
};
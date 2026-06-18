// components/DeliveryChallan.js
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    marginBottom: 5,
  },
  boldText: {
    fontFamily: 'Roboto-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Roboto-Bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTop: 1,
    borderBottom: 1,
    borderLeft: 1,
    borderRight: 1,
    fontFamily: 'Roboto-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderLeft: 1,
    borderRight: 1,
  },
  tableCell: {
    padding: 5,
    borderRight: 1,
    fontSize: 9,
  },
  declaration: {
    marginTop: 15,
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    marginTop: 10,
  },
  signatureLine: {
    borderTop: 1,
    marginTop: 5,
    paddingTop: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const DeliveryChallan = ({ currentData }) => {
  // Default data structure based on your PDF
  const defaultData = {
    millsDeliveryChallanNo: '16079',
    date: '23-08-2025',
    consignee1: {
      name: 'YOUR FASHION SWEATER LTD',
      address:
        'PLOT NO. 126, 1230, 1276 GILARCHALA,\nMASTERBARI, SRIPUR, GAZIPUR-1740, BANGLADESH.\nIRC NUMBER : 260326120171820, BIN NO. 000270725-0103',
    },
    consignee2: {
      name: 'MUTUAL TRUST BANK LIMITED.',
      address:
        'MTB INTERNATIONAL TRADE SERVICES, MOTIJHEEL SUB\nCENTRE, WW TOWER (5TH FLOOR), 68, MOTIJHEEL C/A,\nDHAKA-1000, BANGLADESH.',
    },
    shipper: {
      name: 'Simco Spinning and Textiles Limited',
      address:
        'Dhamshur, Mollikbari, Hajir Bazar, Bhaluka,\nMymensingh, Bangladesh. BIN No.: 000482758-0103',
    },
    lcNo: '0002228250403885',
    lcDate: '12-05-2025',
    amendmentDetails: 'Amendment No. 01, 02 Dated. 18-06-2025, 27-07-2025',
    exportLcContractNo:
      'YFL00098 DATED.05-05-2025, GARMENTS QUANTITY : 99,450 PCS (+/- 5 PCT.) MENS CARDIGAN AND KNITTED PONCHO',
    shipmentDate: '23-08-2025',
    items: [
      {
        sl: '1',
        description:
          'Twisted Yam CYCLO Recycle Cotton Blended Yam 30/2 50% Cyclo Recycled Cotton 50% Recycled Polyester OE Light Grey C48',
        quantity: '940.00',
      },
      {
        sl: '2',
        description:
          'Twisted Yam CYCLO Recycle Cotton Blended Yam 30/2 50% Cyclo Recycled Cotton 50% Recycled Polyester OE Tan C35',
        quantity: '970.00',
      },
    ],
    totalQuantity: '1,910.00',
    proformaInvoices:
      'SSTL/PI/2025/HO00015-R, SSTL/PI/2025/HO002340, SSTL/PI/2025/HO002400 DATED. 28-04-2025, 15-06-2025, 20-07-2025',
    hsCode: '5205.11.00',
    totalBags: '20.00',
    truckNo: 'DHAKA METRO TA 13-8186',
  };

  const data = { ...defaultData, ...currentData };
  const Footer = () => (
    <View style={styles.footer} fixed>
      {/* Left side */}
      <Text>
        Factory: Mouza: Dhamshur, Union: Mollikbari, P.O: Hajir Bazar, P.S: Bhaluka, Dist.:
        Mymensingh, Bangladesh. Web: www.cyclofibers.com
      </Text>

      {/* Center (Page X of Y) */}
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
  return (
    <PDFViewer style={{ width: '100%', height: '80vh', marginTop: 5 }}>
      <Document title='Delivery Challan'>
        <Page size="B4" style={styles.page}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {' '}
              <Image source="/logo/Simco(CMYK).png" style={{ height: 40, width: 120 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
              borderBottom: 1,
              paddingBottom: 5,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
              SIMCO Spinning & Textiles LTD.
            </Text>
            <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>
              House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh.
            </Text>
            <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>
              Telephone:<Text> +88 02 55033401, +88 02 55033401, +88 02 55033402.</Text> Email:
              <Text> info@simcobangladesh.com</Text>
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>DELIVERY CHALLAN</Text>

          {/* Goods Delivered Section */}
          <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={styles.boldText}>
              Goods Delivered : Through Mills Delivery Challan No.: {currentData.ChallanNo}
            </Text>
            <Text> Date: {currentData.ChallanDate}</Text>
          </View>

          {/* Consignee Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '50%' }}>
              <Text style={styles.sectionTitle}>Consignee :</Text>

              <View style={{ marginBottom: 10 }}>
                <Text style={styles.boldText}>(1) {currentData.buyer}</Text>
                <Text style={styles.boldText}>Factory:</Text>
                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.acccountrisk}</Text>
              </View>

              <View>
                <Text style={styles.boldText}>(2) {currentData?.issuingBank}</Text>
                <Text style={{ fontSize: 9, lineHeight: 1.3, width: '50%' }}>{currentData?.bankAddress}</Text>
              </View>
            </View>
            <View style={{ width: '50%' }}>
              {/* Shipper Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shipper:</Text>
                <Text style={styles.boldText}>{data.NotifyName}</Text>
                <Text style={styles.boldText}>Factory:</Text>
                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{data.notifyParty}</Text>
              </View>
              {/* Freight and Shipment */}
              <View style={styles.section}>
                <View style={styles.row}>
                  <Text style={styles.boldText}>{currentData.Collection}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.boldText}>
                    SHIPMENT DATE : {currentData.ShippingBillDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* LC Details */}
          {/* LC Details */}
          <View style={{ marginBottom: 5 }}>
            <Text style={styles.sectionTitle}>LC Details:</Text>
            <View style={styles.row}>
              <Text style={styles.label}>L/C No.</Text>
              <Text style={styles.value}>
                {currentData.LcDetails.LcNo} || {currentData.LcDetails.LcDate}
              </Text>
            </View>
            {currentData.LcDetails.AmendmentDetails &&
              currentData.LcDetails.AmendmentDetails.length > 0 && (
                <View style={{ marginBottom: 3 }}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Amendment Details:</Text>
                    <View style={styles.value}>
                      {currentData.LcDetails.AmendmentDetails.map((amendment, index) => (
                        <Text key={index} style={{ marginBottom: 2 }}>
                          {amendment.AmendmentNo || '-'} || Dated: {amendment.AmendmentDate || '-'}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            <View style={styles.row}>
              <Text style={styles.label}>Export LC/Contract No:</Text>
              <Text style={styles.value}>{currentData.LcDetails.LcNo}</Text>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>SL</Text>
              <Text style={{ ...styles.tableCell, width: '70%', textAlign: 'center' }}>
                DESCRIPTION OF GOODS
              </Text>
              <Text
                style={{ ...styles.tableCell, width: '20%', textAlign: 'center', borderRight: 0 }}
              >
                QUANTITY
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '100%',
                  textAlign: 'center',
                  borderRight: 0,
                  fontFamily: 'Roboto-Bold',
                }}
              >
                {currentData.Description || "N/A"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '100%',
                  textAlign: 'center',
                  borderRight: 0,
                  fontSize: 8,
                }}
              >
                HS Code : {currentData.HSCode}
              </Text>
            </View>

            {currentData.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>
                  {index + 1}
                </Text>
                <Text style={{ ...styles.tableCell, width: '70%' }}>
                  {item.Desc?.split(/\r?\n/).map((line, idx) => (
                    <Text key={idx}>{line.trim()}</Text>
                  ))}
                </Text>
                <Text
                  style={{ ...styles.tableCell, width: '20%', textAlign: 'center', borderRight: 0 }}
                >
                  {
                    // eslint-disable-next-line
                    item.Quantity + ' ' + item.UOMSymbol
                  }
                </Text>
              </View>
            ))}

            {/* Proforma Invoice Details */}
            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '100%',
                  borderRight: 0,
                  fontSize: 8,
                  textAlign: 'center',
                }}
              >
                ( OPEN END YARN ) AS PER PROFORMA INVOICE NO.{' '}
                {currentData.PIDetails.map((pi) => ` ${pi.PI_NO} Dated: ${fDate(pi.PI_Date)}`).join(
                  ', '
                )}
              </Text>
            </View>

            {/* Total Row */}
            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '80%',
                  textAlign: 'center',
                  fontFamily: 'Roboto-Bold',
                }}
              >
                TOTAL
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '20%',
                  textAlign: 'center',
                  fontFamily: 'Roboto-Bold',
                  borderRight: 0,
                }}
              >
                {currentData?.totalQuantity.toLocaleString()} {currentData.items[0].UOMSymbol}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Declaration:</Text>

            <View style={[styles.row, { fontSize: 9 }]}>
              <Text style={styles.label}>Total Goods:</Text>
              <Text style={styles.value}>
                {currentData?.totalQuantity.toLocaleString()} {currentData.items[0].UOMSymbol} BAGS
              </Text>
            </View>

            {/* <View style={[styles.row, { fontSize: 9 }]}>
                            <Text style={styles.label}>Items Description:</Text>
                            <Text style={styles.value}>
                                {data.items.map(item => item.description).join(', ')}
                            </Text>
                        </View> */}

            {/* <View style={[styles.row, { fontSize: 9 }]}>
                            <Text style={styles.label}>Export L/C Details:</Text>
                            <Text style={styles.value}>
                                L/C No. {data.lcNo} || Dated: {data.lcDate}
                            </Text>
                        </View> */}

            {/* <View style={[styles.row, { fontSize: 9 }]}>
                            <Text style={styles.label}>Transport Details:</Text>
                            <Text style={styles.value}>
                                Truck No. {data.truckNo}
                            </Text>
                        </View> */}

            <View style={[styles.row, { fontSize: 9 }]}>
              <Text style={styles.label}>Delivery Factory:</Text>
              <Text style={styles.value}>{currentData?.buyer}</Text>
            </View>

            {/* <View style={[styles.row, { fontSize: 9 }]}>
                            <Text style={styles.label}>Proforma Invoice:</Text>
                            <Text style={styles.value}>
                                {data.proformaInvoices}
                            </Text>
                        </View> */}

            <View style={[styles.row, { fontSize: 9 }]}>
              <Text style={styles.label}>Condition:</Text>
              <Text style={styles.value}>
                Goods delivered in good condition as per specification
              </Text>
            </View>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text>GOODS RECEIVED IN GOOD CONDITION BY</Text>
              <View style={[styles.signatureLine, { marginTop: 70 }]}>
                <Text>Seal & Signature</Text>
              </View>
            </View>

            <View style={styles.signatureBox}>
              <Text>GOODS DELIVERED BY</Text>
              <Text style={styles.boldText}>Simco Spinning and Textiles Limited</Text>
              {/* <View style={styles.signatureLine}>
                                <Text>Seal & Signature</Text>
                            </View> */}
            </View>
          </View>

          <Footer />
        </Page>
      </Document>
    </PDFViewer>
  );
};

// Font registrations
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });

DeliveryChallan.propTypes = {
  currentData: PropTypes.object,
};

DeliveryChallan.defaultProps = {
  currentData: {},
};

export default DeliveryChallan;

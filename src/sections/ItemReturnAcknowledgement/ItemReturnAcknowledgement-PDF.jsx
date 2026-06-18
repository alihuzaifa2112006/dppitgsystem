import {
  View,
  Text,
  Page,
  Font,
  Document,
  PDFViewer,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer';
import React from 'react';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------- Fonts -----------
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/CenturyGothic.ttf' });

// Check if data is Transfer Acknowledgement format (from grid props)
const isTransferAcknowledgementData = (data) =>
  data &&
  (data.TransferNo !== undefined ||
    data.TransferID !== undefined ||
    data.ToDeptName !== undefined);

// ==================== MAIN COMPONENT ====================
const ItemReturnAcknowledgementPDF = ({ currentData }) => {
  const details = Array.isArray(currentData) ? currentData : [];

  if (!details.length) {
    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
          <Page size="A4" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text>No Data Found</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  const useTransferFormat = isTransferAcknowledgementData(details[0]);

  // ----------- Styles -----------
  const styles = StyleSheet.create({
    page: {
      paddingTop: 2,
      paddingBottom: 10,
      paddingHorizontal: 20,
      fontSize: 10,
      fontFamily: 'Century Gothic',
      color: '#000000',
    },
    header: {
      marginBottom: 5,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 2,
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 5,
      textTransform: 'uppercase',
      fontFamily: 'Roboto-Bold',
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Roboto-Bold',
      marginVertical: 8,
      paddingBottom: 3,
      borderBottom: 1,
      borderColor: '#000000',
    },
    infoRow: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#e0e0e0',
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    infoLabel: {
      width: '35%',
      fontFamily: 'Roboto-Medium',
      fontSize: 10,
    },
    infoValue: {
      flex: 1,
      fontFamily: 'Roboto-Regular',
      fontSize: 10,
      textAlign: 'left',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottom: 1,
      borderTop: 1,
      borderColor: '#000000',
      alignItems: 'center',
    },
    th: {
      padding: 6,
      fontFamily: 'Roboto-Bold',
      fontSize: 9,
      borderRight: 1,
      borderColor: '#000000',
      textAlign: 'center',
    },
    td: {
      padding: 5,
      fontSize: 9,
      borderRight: 1,
      borderColor: '#000000',
      textAlign: 'center',
      minHeight: 24,
    },
    row: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#000',
      alignItems: 'stretch',
      minHeight: 24,
    },
    footer: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 9,
      paddingTop: 10,
      borderTop: '1 solid #000000',
      marginHorizontal: 30,
    },
  });

  // ----------- Header Component -----------
  const Header = () => (
    <View style={styles.header} fixed>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 10 }}>
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold' }}>
            SIMCO SPINNING & TEXTILES LIMITED
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3, fontSize: 10 }}>
            Factory: Dhamshur, Mollikbari, Hajirbazar, Bhaluka Mymensingh, Bangladesh
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 2, fontSize: 10 }}>
            Office: House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh
          </Text>
        </View>
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>
  );

  // ----------- Footer Component -----------
  const Footer = () => (
    <View style={styles.footer} fixed>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Powered by : ITG Technology Company | </Text>
          <Link src="https://www.itgllc.ae/" style={{ textDecoration: 'none' }}>
            <Text>Visit www.itgllc.ae</Text>
          </Link>
        </View>
        <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </View>
    </View>
  );

  // ========== TRANSFER ACKNOWLEDGEMENT PDF (from props) ==========
  if (useTransferFormat) {
    const columnFlex = [1.2, 2.5, 0.9, 1, 1.2, 1.2, 1.2, 0.8];
    const columnHeaders = [
      'Item Code',
      'Item Description',
      'Voucher Qty',
      'Type',
      'To Department',
      'To Location',
      'Transfer Mode',
      'Status',
    ];

    const totalQty = details.reduce((sum, d) => sum + (d.VoucherQty || 0), 0);
    const firstRow = details[0];

    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document title={`Stock Acknowledgement - ${firstRow.TransferNo || 'N/A'}`}>
          <Page size={[800, 842]} style={styles.page}>
            <Header />

            {/* Title */}
            <Text style={[styles.title, { marginTop: 15 }]}>Stock Acknowledgement Report</Text>

            {/* Transfer Info Section */}
            <Text style={styles.sectionTitle}>Transfer Information</Text>
            <View style={{ border: 1, borderColor: '#000', marginTop: 5 }}>
              {[
                ['Transfer No', firstRow.TransferNo || '-'],
                ['Transfer Date', firstRow.TransferDate ? fDate(firstRow.TransferDate) : '-'],
                ['To Department', firstRow.ToDeptName || '-'],
                ['To Location', firstRow.ToLocationName || '-'],
                ['Transfer Mode', firstRow.TransferModeName || '-'],
                ['Section', firstRow.SectionName || '-'],
              ].map(([label, value], i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}:</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Acknowledgement Info */}
            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Acknowledgement Details</Text>
            <View style={{ border: 1, borderColor: '#000', marginTop: 5 }}>
              {[
                ['Status', firstRow.IsAcknowledge ? 'Acknowledged' : 'Pending'],
                ['Acknowledge By', firstRow.AcknowledgeByName || '-'],
                ['Acknowledge Date', firstRow.AcknowledgeDate ? fDate(firstRow.AcknowledgeDate) : '-'],
              ].map(([label, value], i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}:</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Items Table */}
            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Item Details</Text>
            <View style={{ border: 1, borderColor: '#000', marginTop: 10 }}>
              <View style={styles.tableHeader}>
                {columnHeaders.map((col, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.th,
                      {
                        flex: columnFlex[index],
                        borderLeft: index === 0 ? 1 : 0,
                        borderColor: '#000000',
                      },
                    ]}
                  >
                    {col}
                  </Text>
                ))}
              </View>

              {details.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  <Text style={[styles.td, { flex: columnFlex[0] }]}>{row.ItemCode || 'N/A'}</Text>
                  <Text style={[styles.td, { flex: columnFlex[1], textAlign: 'left' }]}>
                    {row.ItemDescription || 'N/A'}
                  </Text>
                  <Text style={[styles.td, { flex: columnFlex[2] }]}>
                    {fNumber(row.VoucherQty)}
                  </Text>
                  <Text style={[styles.td, { flex: columnFlex[3] }]}>{row.Types || '-'}</Text>
                  <Text style={[styles.td, { flex: columnFlex[4] }]}>{row.ToDeptName || '-'}</Text>
                  <Text style={[styles.td, { flex: columnFlex[5] }]}>{row.ToLocationName || '-'}</Text>
                  <Text style={[styles.td, { flex: columnFlex[6] }]}>{row.TransferModeName || '-'}</Text>
                  <Text style={[styles.td, { flex: columnFlex[7] }]}>
                    {row.IsAcknowledge ? 'Acknowledged' : 'Pending'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View
              style={{
                border: 1,
                borderColor: '#000',
                padding: 8,
                marginTop: 12,
                width: '35%',
                alignSelf: 'flex-end',
                backgroundColor: '#f9f9f9',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>Total Voucher Qty:</Text>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>{fNumber(totalQty)}</Text>
              </View>
            </View>

            <Footer />
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  // ========== LEGACY: GetIssueDetails PDF (from API) ==========
  const master = details[0];
  const totalQty = details.reduce((sum, d) => sum + (d.IssueQty || 0), 0);
  const columnFlex = [1.2, 2.5, 0.7, 0.9, 1, 1.5, 1.2, 1.2];
  const columnHeaders = [
    'Item Code',
    'Description',
    'UOM',
    'Issued Qty',
    'Remaining Qty',
    'Remarks',
    'Store',
    'Location',
  ];

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`ITEM ISSUE REPORT - ${master.ChallanNo || master.GRNNo}`}>
        <Page size={[800, 842]} style={styles.page}>
          <Header />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              marginTop: 20,
              paddingBottom: 5,
            }}
          >
            <View style={{ flex: 1, textAlign: 'left' }}>
              <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12 }}>GRN No: {master.GRNNo || '-'}</Text>
              <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12, marginTop: 8 }}>
                Issue Code: {master.IssueCode || '-'}
              </Text>
            </View>
            <View style={{ flex: 2, textAlign: 'center' }}>
              <Text style={styles.title}>Item Issuance Report</Text>
            </View>
            <View style={{ flex: 1, textAlign: 'right' }}>
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold' }}>GRN Date: {fDate(master.GRNDate)}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', marginTop: 8 }}>
                Issue Date: {fDate(master.IssueDate)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ width: '49%', marginBottom: 15 }}>
              <View style={{ border: 1, borderColor: '#000', borderRadius: 3, minHeight: 80 }}>
                <View
                  style={{
                    borderBottom: 1,
                    borderColor: '#000',
                    padding: 5,
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 11, textAlign: 'center' }}>
                    GRN Information
                  </Text>
                </View>
                {[
                  ['Challan No', master.ChallanNo || 'N/A'],
                  ['Vendor', master.VendorName || 'N/A'],
                ].map(([label, value], i) => (
                  <View key={i} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{label}:</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ width: '49%', marginBottom: 15 }}>
              <View style={{ border: 1, borderColor: '#000', borderRadius: 3, minHeight: 80 }}>
                <View
                  style={{
                    borderBottom: 1,
                    borderColor: '#000',
                    padding: 5,
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 11, textAlign: 'center' }}>
                    Delivery Information
                  </Text>
                </View>
                {[
                  ['Vehicle No', master.VehicleNo || 'N/A'],
                  ['Driver', master.DriverName || 'N/A'],
                ].map(([label, value], i) => (
                  <View key={i} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{label}:</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Issued Items Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }}>
            <View style={styles.tableHeader}>
              {columnHeaders.map((col, index) => (
                <Text
                  key={index}
                  style={[
                    styles.th,
                    { flex: columnFlex[index], borderLeft: index === 0 ? 1 : 0, borderColor: '#000000' },
                  ]}
                >
                  {col}
                </Text>
              ))}
            </View>
            {details.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                <Text style={[styles.td, { flex: columnFlex[0] }]}>{row.ItemCode || 'N/A'}</Text>
                <Text style={[styles.td, { flex: columnFlex[1], textAlign: 'left' }]}>
                  {row.ItemDescription || 'N/A'}
                </Text>
                <Text style={[styles.td, { flex: columnFlex[2] }]}>{row.UOMName || 'N/A'}</Text>
                <Text style={[styles.td, { flex: columnFlex[3] }]}>{fNumber(row.IssueQty)}</Text>
                <Text style={[styles.td, { flex: columnFlex[4] }]}>{fNumber(row.RemainingQty) || 0}</Text>
                <Text style={[styles.td, { flex: columnFlex[5], textAlign: 'left' }]}>
                  {row.Remarks || 'N/A'}
                </Text>
                <Text style={[styles.td, { flex: columnFlex[6] }]}>{row.StoreName || 'N/A'}</Text>
                <Text style={[styles.td, { flex: columnFlex[7] }]}>{row.LocationName || 'N/A'}</Text>
              </View>
            ))}
          </View>

          <View
            style={{
              border: 1,
              borderColor: '#000',
              padding: 8,
              marginTop: 12,
              width: '40%',
              alignSelf: 'flex-end',
              backgroundColor: '#f9f9f9',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>Total Issued Qty:</Text>
              <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>
                {fNumber(totalQty)} {master.UOMName || ''}
              </Text>
            </View>
          </View>

          <Footer />
        </Page>
      </Document>
    </PDFViewer>
  );
};

ItemReturnAcknowledgementPDF.propTypes = {
  currentData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default ItemReturnAcknowledgementPDF;

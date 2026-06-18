// components/DepartmentalRequestPDF.js
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
  Link,
} from '@react-pdf/renderer';

import PropTypes from 'prop-types';
import { fNumber } from 'src/utils/format-number';

const styles = StyleSheet.create({
  page: {
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: 25,
    fontSize: 8,
    fontFamily: 'Century Gothic',
    color: '#000000',
  },
  header: {
    marginBottom: 10,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 6,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 3,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    fontFamily: 'Roboto-Bold',
    borderTop: 1,
    borderLeft: 1,
    borderRight: 1,
    borderColor: '#000000',
  },
  cell: {
    padding: 3,
    fontSize: 7,
    borderBottom: 1,
    borderColor: '#000000',
  },
  headerCell: {
    padding: 3,
    fontSize: 7,
    textAlign: 'center',
    borderBottom: 1,
    borderRight: 1,
    borderColor: '#000000',
    fontFamily: 'Roboto-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    paddingTop: 6,
    borderTop: '1 solid #000000',
    marginHorizontal: 25,
  },
  totalBox: {
    border: 1,
    borderColor: '#000000',
    padding: 4,
    marginTop: 8,
    marginBottom: 10,
    width: '38%',
    alignSelf: 'flex-end',
  },
  totalText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 6,
  },
  prInfo: {
    flex: 1,
    textAlign: 'left',
  },
  dateInfo: {
    flex: 1,
    textAlign: 'right',
  },
  dateBox: {
    padding: 3,
  },
  centerTitle: {
    flex: 2,
    textAlign: 'center',
  },
  infoContent: {
    border: 1,
    borderColor: '#000000',
    borderRadius: 3,
    padding: 0,
    marginBottom: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#000000',
    padding: 4,
    backgroundColor: '#f0f0f0',
  },
  infoHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    fontSize: 9,
  },
  infoRowInner: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  infoLabelInner: {
    flex: 1,
    fontFamily: 'Roboto-Medium',
    fontSize: 8,
  },
  infoValueInner: {
    flex: 1,
    textAlign: 'left',
    fontSize: 8,
  },
  approvalContainer: {
    marginTop: 25,
  },
  approvalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  approvalColumn: {
    width: '30%',
    textAlign: 'center',
  },
  approvalBox: {
    paddingTop: 6,
  },
  approvalTitle: {
    fontSize: 9,
    fontFamily: 'Roboto-Medium',
    marginTop: 3,
  },
  underline: {
    borderBottom: 1,
    borderColor: '#000000',
    marginTop: 3,
    width: '100%',
  },
  approvalName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 10,
  },
});

const columnWidths = ['6%', '10%', '20%', '15%', '12%', '10%', '8%', '10%', '10%', '10%', '9%'];
const issuedColumnWidths = ['12%', '20%', '12%', '12%', '12%', '12%', '12%', '8%'];

// Header Component - moved outside to avoid nested component warning
const Header = () => (
  <View style={styles.header} fixed>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        marginTop: 6,
      }}
    >
      <View>
        <Image source="/logo/Simco(CMYK).png" style={{ height: 28, width: 110 }} />
      </View>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 6,
          marginTop: 6,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
          SIMCO SPINNING & TEXTILES LIMITED
        </Text>
        <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 2, fontSize: 8 }}>
          Factory Address:{' '}
          <Text style={{ fontSize: 8 }}>
            Dhamshur, Mollikbari, Hajirbazar, Bhaluka Mymensingh, Bangladesh
          </Text>
        </Text>
        <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 2, fontSize: 8 }}>
          Office Address:{' '}
          <Text style={{ fontSize: 8 }}>
            House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh.
          </Text>
        </Text>
      </View>
      <View>
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 32, width: 85 }} />
      </View>
    </View>
  </View>
);

const DepartmentalRequestPDF = ({ currentData, PRRequestID }) => {
  // Format the date from the API
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  console.log(currentData, 'this is data current');

  // Calculate totals based on your data structure
  const totalRequestedQty =
    currentData?.Details?.reduce((acc, item) => acc + (item.TotalRequestedQty || 0), 0) || 0;
  // const totalRemainingQty = currentData?.Details?.reduce((acc, item) => acc + (item.RemainingQty || 0), 0) || 0; // Old line
  const totalAvailableQty =
    currentData?.Details?.reduce((acc, item) => acc + (item.TotalQty || 0), 0) || 0;

  // UPDATED: Calculate Total Remaining Qty as the sum of (TotalQty - TotalRequestedQty) for each item
  const totalRemainingQty =
    currentData?.Details?.reduce((acc, item) => {
      const totalQty = item.TotalQty || 0;
      const requestedQty = item.TotalRequestedQty || 0;
      const remaining = totalQty - requestedQty;
      return acc + remaining;
    }, 0) || 0;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Departmental Request - ${currentData?.ReqCode}`}
        subject="Departmental Request Report"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        <Page size="A3" style={styles.page}>
          {/* Header */}
          <Header />

          {/* Top Row with Request Info and Title */}
          <View style={styles.topRow}>
            {/* <View style={styles.prInfo}>
              <View style={styles.dateBox}>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10, textAlign: 'center' }}>
                  Req No: {currentData?.ReqCode || 'N/A'}
                </Text>
              </View>
            </View> */}
            <View style={styles.centerTitle}>
              <View style={styles.dateBox}>
                <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                  General Product Requisition (Store)
                </Text>
              </View>
            </View>
            {/* <View style={styles.dateInfo}>
              <View style={styles.dateBox}>
                <Text style={{ fontSize: 10, textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                  Req Date: {formatDate(currentData?.ReqDate)}
                </Text>
              </View>
            </View> */}
          </View>

          {/* Request Information Box - Full Width */}
          <View style={styles.infoContent}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Requisition Information</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '50%' }}>
                {[
                  ['Requisition Code', currentData?.ReqCode || 'N/A'],
                  ['Requisition Date', formatDate(currentData?.ReqDate)],
                  ['Department', currentData?.DeptName || 'N/A'],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
              <View style={{ width: '50%' }}>
                {[
                  ['Section', currentData?.SectionName || 'N/A'],
                  ['Request To', currentData?.RequestToName || 'N/A'],
                  ['MRP No', currentData?.MRPNO || 'N/A'],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, marginBottom: 3 }}>
            <Text style={{
              fontSize: 10,
              fontFamily: 'Roboto-Bold',
              fontWeight: 'bold',

              color: '#000000'
            }}>
              Requested Items
            </Text>
          </View>
          {/* Item Details Table */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 6 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'SL No.',
                'Item Code',
                // 'Sub Category',
                'Item Description',
                'Supplier Name',
                'Store',
                'Location',
                // 'UOM',
                'Available Qty',
                'Requested Qty',
                'Balance Qty',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: columnWidths[i],
                    padding: 3,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 7,
                    borderRight: i !== 8 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>


            {currentData?.Details?.map((item, idx) => {

              const rowRemainingQty = (item.TotalQty || 0) - (item.TotalRequestedQty || 0);

              return (
                <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                  {[
                    idx + 1,
                    item.itemCode || 'N/A',
                    // item.SubCatName || 'N/A',
                    item.ItemDescription || '-',
                    item.VendorName || 'N/A',
                    item.StoreName || 'N/A',
                    item.LocationName || 'N/A',
                    // item.UOMName || 'N/A',
                    `${fNumber(item.TotalQty) || 0} ${item.UOMName || ''}`,
                    `${fNumber(item.TotalRequestedQty) || 0} ${item.UOMName || ''}`,
                    // UPDATED: Use the calculated Remaining Qty for the row
                    `${fNumber(rowRemainingQty) || 0} ${item.UOMName || ''}`,
                  ].map((val, i) => (
                    <Text
                      key={i}
                      style={{
                        width: columnWidths[i],
                        fontSize: 7,
                        fontFamily: 'Roboto-Regular',
                        padding: 3,
                        borderRight: i !== 8 ? 1 : 0,
                        borderColor: '#000',
                        textAlign: i >= 6 ? 'right' : 'left',
                      }}
                    >
                      {val}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>



          <View style={{ marginTop: 10, marginBottom: 3 }}>
            <Text style={{
              fontSize: 10,
              fontFamily: 'Roboto-Bold',
              fontWeight: 'bold',

              color: '#000000'
            }}>
              Issued Items
            </Text>
          </View>



          <View style={{ border: 1, borderColor: '#000', marginTop: 6 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'Item Code',
                'Item Description',
                'Vendor Name',
                'Driver Name',
                'Vehicle No',
                'Issued Date',
                'Issued Qty',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: issuedColumnWidths[i],
                    padding: 3,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 7,
                    borderRight: i !== 6 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {/* Table Rows */}
            {currentData?.Details?.map((item, idx) => {

              const rowRemainingQty = (item.TotalQty || 0) - (item.TotalRequestedQty || 0);
              // Issued Qty - adjust field name if needed (could be item.IssuedQty, item.IssueQty, etc.)
              const issuedQty = item.IssueQty || item.IssuedQty || 0;
              const issuedDate = item.IssueDate ? formatDate(item.IssueDate) : '-';

              return (
                <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                  {[
                    item.itemCode || 'N/A',
                    item.ItemDescription || '-',
                    item.VendorName || 'N/A',
                    item.DriverName || '-',
                    item.VehNO || '-',
                    issuedDate,
                    `${fNumber(issuedQty) || 0} ${item.UOMName || ''}`,
                  ].map((val, i) => (
                    <Text
                      key={i}
                      style={{
                        width: issuedColumnWidths[i],
                        fontSize: 7,
                        fontFamily: 'Roboto-Regular',
                        padding: 3,
                        borderRight: i !== 6 ? 1 : 0,
                        borderColor: '#000',
                        textAlign: i >= 5 ? 'right' : 'left',
                      }}
                    >
                      {val}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>




          {/* Totals Box */}
          <View style={styles.totalBox}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Available Qty:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {fNumber(totalAvailableQty)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Requested Qty:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {fNumber(totalRequestedQty)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Remaining Qty:</Text>
              <Text
                style={{
                  ...styles.totalText,
                  textAlign: 'right',
                  color: '#555555',
                }}
              >
                {fNumber(totalRemainingQty)}
              </Text>
            </View>
          </View>

          {/* Approval Signatures */}
          <View style={styles.approvalContainer}>
            <View style={styles.approvalRow}>
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{currentData?.CreatedByName || '-'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Prepared By</Text>
                </View>
              </View>

              {/* Recommended By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{currentData?.RequestToName || '-'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Requested To</Text>
                </View>
              </View>

              {/* Approved By */}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company | </Text>
                <Link src="https://www.itgllc.ae/" style={{ textDecoration: 'none' }}>
                  <Text>Visit www.itgllc.ae</Text>
                </Link>
              </View>
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

// Font registrations
Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
  family: 'Roboto-Regular',
  src: '/fonts/Roboto-Regular.ttf',
});

export default DepartmentalRequestPDF;

DepartmentalRequestPDF.propTypes = {
  currentData: PropTypes.shape({
    ReqCode: PropTypes.string,
    ReqDate: PropTypes.string,
    DeptName: PropTypes.string,
    SectionName: PropTypes.string,
    RequestToName: PropTypes.string,
    CreatedByName: PropTypes.string,
    MRPNO: PropTypes.string,
    Details: PropTypes.arrayOf(
      PropTypes.shape({
        itemCode: PropTypes.string,
        ItemDescription: PropTypes.string,
        VendorName: PropTypes.string,
        StoreName: PropTypes.string,
        LocationName: PropTypes.string,
        UOMName: PropTypes.string,
        TotalQty: PropTypes.number,
        TotalRequestedQty: PropTypes.number,
      })
    ),
  }),
  PRRequestID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

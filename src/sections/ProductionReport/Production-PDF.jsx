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
import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ==================== MAIN COMPONENT ====================
const ProductionPDF = ({ currentData }) => {
  const Master = currentData;
  const Workers = currentData?.Workers || [];
  // ⚡ NEW: Extract Waste Rejections array
  const WasteRejections = currentData?.WasteRejections || [];
  // ⚡ NEW: Extract Details array for received items
  const ReceivedItems = currentData?.Details || [];

  // ----------- Font Registration (Keep as is) -----------
  Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
  const formatTransferTo = (code) => {
    switch (code) {
      case 1:
        return 'Transfer to Store';
      case 2:
        return 'Sorted Clips Storage Location';
      case 3:
        return 'Transfer To Margasa Section';
      default:
        return code || 'N/A';
    }
  };
  // ----------- Group Workers by BoxNo (Keep as is) -----------
  const groupedByBox = Workers.reduce((acc, worker) => {
    const boxNo = worker.BoxNo || 'Unknown';
    if (!acc[boxNo]) {
      acc[boxNo] = {
        boxNo,
        workers: [],
        bagDetails: worker.BagDetails || '-',
        totalBag: worker.TotalBag || 0,
      };

    }
    acc[boxNo].workers.push(worker.WorkerName || '-');
    return acc;
  }, {});

  const groupedDetails = Object.values(groupedByBox);

  // ----------- Calculate TOTAL BAGS (Keep as is) -----------
  const totalBags = groupedDetails.reduce((sum, group) => sum + (group.totalBag || 0), 0);

  // ⚡ NEW: Calculate Total Waste/Rejected Weight from the WasteRejections array
  const totalWasteRejectedWeight = WasteRejections.reduce(
    (sum, rejection) => sum + (rejection.WasteQty || 0),
    0
  );

  // ⚡ NEW: Calculate Total Issued Quantity from Details array
  const totalIssuedQty = ReceivedItems.reduce(
    (sum, item) => sum + (parseFloat(item.IssueConfQty) || 0),
    0
  );

  const uom = Master.UOMName || '-';


  const styles = StyleSheet.create({
    page: {
      paddingTop: 10,
      paddingBottom: 50,
      paddingHorizontal: 30,
      fontSize: 10,
      fontFamily: 'Century Gothic',
      color: '#000000',
    },
    header: {
      marginBottom: 15,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 10,
    },
    title: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 5,
      textTransform: 'uppercase',
      fontFamily: 'Roboto-Bold',
    },
    subtitle: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 15,
      fontFamily: 'Roboto-Medium',
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Roboto-Bold',
      marginVertical: 8,
      paddingBottom: 3,
      borderBottom: 1,
      borderColor: '#000000',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 10,
    },
    grnInfo: { flex: 1, textAlign: 'left' },
    centerTitle: { flex: 2, textAlign: 'center' },
    dateInfo: { flex: 1, textAlign: 'right' },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    infoSection: { width: '49%', marginBottom: 15 },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      minHeight: 140, // Reduced slightly as rejection content is smaller
    },
    infoHeader: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#000000',
      padding: 5,
      backgroundColor: '#f0f0f0',
    },
    infoHeaderText: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Roboto-Bold',
      fontSize: 11,
    },
    infoRowInner: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#e0e0e0',
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    infoLabelInner: { flex: 1, fontFamily: 'Roboto-Medium' },
    infoValueInner: { flex: 1, textAlign: 'left' },
    totalBox: {
      border: 1,
      borderColor: '#000000',
      padding: 5,
      marginTop: 10,
      marginBottom: 15,
      width: '38%',
      alignSelf: 'flex-end',
    },
    totalText: { fontFamily: 'Roboto-Bold', fontSize: 10 },
    approvalContainer: { marginTop: 40 },
    approvalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    approvalColumn: { width: '30%', textAlign: 'center' },
    approvalBox: { paddingTop: 10 },
    approvalTitle: { fontSize: 11, fontFamily: 'Roboto-Medium', marginTop: 5 },
    underline: { borderBottom: 1, borderColor: '#000000', marginTop: 5, width: '100%' },
    approvalName: { fontFamily: 'Roboto-Bold', fontSize: 12 },
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
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottom: 1,
      borderColor: '#000',
    },
    tableCell: {
      padding: 4,
      fontSize: 9,
      borderRight: 1,
      borderColor: '#000',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderTop: 1,
      borderColor: '#000',
    },
  });

  // ----------- Header Component (Keep as is) -----------
  const Header = () => (
    <View style={styles.header} fixed>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold' }}>
            SIMCO SPINNING & TEXTILES LIMITED
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
            Factory Address:{' '}
            <Text style={{ fontSize: 12 }}>
              Dhamshur, Mollikbari, Hajirbazar, Bhaluka Mymensingh, Bangladesh
            </Text>
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
            Office Address:{' '}
            <Text style={{ fontSize: 12 }}>
              House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh.
            </Text>
          </Text>
        </View>
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>
  );

  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`PRODUCTION REPORT - ${Master.PDONO}`}>
        <Page size={[842]} style={styles.page}>
          {/* Header */}
          <Header />

          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
                  marginTop: 5,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                No. {Master.PDONO || '-'}
              </Text>
            </View>
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                Daily Production Sorting Report
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                Supervisor: {Master.SupervisorName}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Roboto-Bold',
                  marginTop: 3,
                }}
              >
                Report Date: {fDate(Master.ReportDate)}
              </Text>
            </View>
          </View>

          {/* Merged Info Table - Full Width with Two Columns */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 15 }}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Daily Production Sorting Report</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                ['Report Date', fDate(Master.ReportDate)],
                ['Supervisor Name', Master.SupervisorName || '-'],
                ['Shift', Master.ShiftName || '-'],
                ['Sorted Qty', `${fNumber(Master.SortedQty)} ${uom}`],
                ['Remaining Qty', `${fNumber(Master.SortedRemQty)} ${uom}`],
                ['Total Rejected Weight', `${fNumber(totalWasteRejectedWeight)} ${uom}`],
                ['Reason of Reject', Master.ReasonOfRejec || '-'],
                ['Remarks', Master.Remarks || '-'],
              ].map(([label, value], i) => {
                const isLeftColumn = i % 2 === 0;
                const isLastRow = i >= 6;
                return (
                  <View
                    key={i}
                    style={{
                      width: '50%',
                      flexDirection: 'row',
                      borderRight: isLeftColumn ? 1 : 0,
                      borderBottom: isLastRow ? 0 : 1,
                      borderColor: '#000',
                    }}
                  >
                    <View style={{
                      width: '40%',
                      borderRight: 1,
                      borderColor: '#000',
                      padding: 5,
                      backgroundColor: '#f0f0f0',
                    }}>
                      <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 9 }}>{label}:</Text>
                    </View>
                    <View style={{
                      width: '60%',
                      padding: 5,
                    }}>
                      <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 9 }}>{value || '-'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>


          <Text style={styles.sectionTitle}>Requested Items Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 15 }} wrap>
            <View style={styles.tableHeader}>
              {['Req Code', 'Item Code', 'Item Description', 'Qty', 'Unit'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    ...styles.tableCell,
                    width: ['18%', '18%', '32%', '16%', '16%'][i],
                    fontFamily: 'Roboto-Bold',
                    borderRight: i !== 4 ? 1 : 0,
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {ReceivedItems.length > 0 ? (
              ReceivedItems.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text
                    style={{ ...styles.tableCell, width: '18%', borderRight: 1, textAlign: 'left' }}
                  >
                    {item.ReqCode || '-'}
                  </Text>

                  <Text
                    style={{ ...styles.tableCell, width: '18%', borderRight: 1, textAlign: 'left' }}
                  >
                    {item.IssueItemCode || '-'}
                  </Text>

                  <Text
                    style={{ ...styles.tableCell, width: '32%', borderRight: 1, textAlign: 'left' }}
                  >
                    {item.IssueItemDescription || '-'}
                  </Text>

                  <Text
                    style={{ ...styles.tableCell, width: '16%', borderRight: 1, textAlign: 'right' }}
                  >
                    {fNumber(item.IssueConfQty) || '-'}
                  </Text>

                  <Text
                    style={{
                      ...styles.tableCell,
                      width: '16%',
                      textAlign: 'center',
                      borderRight: 0,
                    }}
                  >
                    {item.UOMName || '-'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: '100%',
                    borderRight: 0,
                    paddingVertical: 8,
                    textAlign: 'center',
                  }}
                >
                  No received items recorded.
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Sorted Item</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 15 }} wrap>
            <View style={styles.tableHeader}>
              {['Item Code', 'Item Description', 'Sorted Qty', 'Unit'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    ...styles.tableCell,
                    width: ['20%', '40%', '20%', '20%'][i],
                    fontFamily: 'Roboto-Bold',
                    borderRight: i !== 3 ? 1 : 0,
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            <View style={styles.tableRow}>

              <Text
                style={{ ...styles.tableCell, width: '20%', borderRight: 1, textAlign: 'left' }}
              >
                {Master.SortedItemCode || '-'}
              </Text>

              <Text
                style={{ ...styles.tableCell, width: '40%', borderRight: 1, textAlign: 'left' }}
              >
                {Master.SortedItem || Master.ItemDescription || '-'}
              </Text>

              <Text
                style={{
                  ...styles.tableCell,
                  width: '20%',
                  textAlign: 'right',
                  borderRight: 1,
                }}
              >
                {fNumber(Master.SortedQty) || '-'}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: '20%',
                  textAlign: 'right',
                  borderRight: 0,
                }}
              >
                {Master.UOMName || '-'}
              </Text>
            </View>
          </View>


          {/* <Text style={styles.sectionTitle}>Workers Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 15 }} wrap>
            <View style={styles.tableHeader}>
              {['Box No', 'Worker Names', 'Bag Details', 'Total Bags'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    ...styles.tableCell,
                    width: ['15%', '40%', '25%', '20%'][i],
                    fontFamily: 'Roboto-Bold',
                    borderRight: i !== 3 ? 1 : 0,
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {groupedDetails.map((group, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '15%', borderRight: 1, borderTop: 0 }}>
                  {group.boxNo}
                </Text>

                <Text
                  style={{ ...styles.tableCell, width: '40%', borderRight: 1, borderTop: 0, textAlign: 'left' }}
                >
                  {group.workers.join(', ')}
                </Text>

                <Text
                  style={{ ...styles.tableCell, width: '25%', borderRight: 1, borderTop: 0, textAlign: 'right' }}
                >
                  {group.bagDetails}
                </Text>

                <Text
                  style={{ ...styles.tableCell, width: '20%', textAlign: 'right', borderTop: 0, borderRight: 0 }}
                >
                  {fNumber(group.totalBag)}
                </Text>
              </View>
            ))}
          </View> */}

          <Text style={styles.sectionTitle}>Item Waste Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            <View style={styles.tableHeader}>
              {['Category', 'Item Code', 'Item Description', 'Quantity'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    ...styles.tableCell,
                    width: ['20%', '20%', '40%', '20%'][i],
                    fontFamily: 'Roboto-Bold',
                    borderRight: i !== 3 ? 1 : 0,
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {WasteRejections.length > 0 ? (
              WasteRejections.map((waste, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text
                    style={{ ...styles.tableCell, width: '20%', borderRight: 1, borderTop: 0, textAlign: 'left' }}
                  >
                    {waste.CategoryName || '-'}
                  </Text>

                  <Text
                    style={{ ...styles.tableCell, width: '20%', borderRight: 1, borderTop: 0, textAlign: 'left' }}
                  >
                    {waste.ItemCode || '-'}
                  </Text>
                  <Text
                    style={{ ...styles.tableCell, width: '40%', borderRight: 1, borderTop: 0, textAlign: 'left' }}
                  >
                    {waste.ItemDescription || '-'}
                  </Text>

                  <Text
                    style={{
                      ...styles.tableCell,
                      width: '20%',
                      textAlign: 'right',
                      borderRight: 0,
                    }}
                  >
                    {`${fNumber(waste.WasteQty)} ${uom}`}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: '100%',
                    borderRight: 0,
                    paddingVertical: 8,
                    textAlign: 'center',
                  }}
                >
                  No waste rejections recorded.
                </Text>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalBox}>
            {[
              ['Total Rejected Weight:', totalWasteRejectedWeight, uom],
            ].map(([label, val, unit], i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 2,
                }}
              >
                <Text style={styles.totalText}>{label}</Text>
                <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                  {fNumber(val) || 0} {unit}
                </Text>
              </View>
            ))}
          </View>

          {/* Approval Section */}
          <View style={styles.approvalContainer}>
            <View style={styles.approvalRow}>
              {[
                ['Created By', Master.CreatedByName, true],
                // ['Checked By', Master.SupervisorName, true], // Kept commented as in original
                // ['Approved By', Master.ApprovedBy, Master.IsApproved], // Kept commented as in original
              ].map(([title, name, isDone], i) => {
                const approvalNameColor = isDone ? '#000000' : '#FF0000';
                const displayValue = name || (isDone ? '-' : 'Pending');

                return (
                  <View key={i} style={styles.approvalColumn}>
                    <View style={styles.approvalBox}>
                      <Text style={{ ...styles.approvalName, color: approvalNameColor }}>
                        {displayValue}
                      </Text>
                      <View style={styles.underline} />
                      <Text style={styles.approvalTitle}>{title}</Text>
                    </View>
                  </View>
                );
              })}
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

// ==================== PROPTYPES ====================
ProductionPDF.propTypes = {
  currentData: PropTypes.object.isRequired,
};

export default ProductionPDF;

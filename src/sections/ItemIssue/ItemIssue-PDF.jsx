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

// ==================== MAIN COMPONENT ====================
const ItemIssuePDF = ({ currentData }) => {
  const details = Array.isArray(currentData) ? currentData : [];

  if (!details.length) {
    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
          <Page size="A3" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text>No Data Found</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  const master = details[0];

  // Split data into regular items and history items
  const regularItems = details.filter((d) => !d.HistoryID || d.HistoryID === null);
  const historyItems = details.filter((d) => d.HistoryID && d.HistoryID !== null);

  const totalQty = regularItems.reduce((sum, d) => sum + (d.IssueQty || 0), 0);

  const ITEMS_PER_PAGE_INITIAL = 20;
  const ITEMS_PER_PAGE_SUBSEQUENT = 30;

  // Create page chunks for regular items
  const regularPageChunks = [];
  if (regularItems.length > 0) {
    regularPageChunks.push(regularItems.slice(0, ITEMS_PER_PAGE_INITIAL));
    for (let i = ITEMS_PER_PAGE_INITIAL; i < regularItems.length; i += ITEMS_PER_PAGE_SUBSEQUENT) {
      regularPageChunks.push(regularItems.slice(i, i + ITEMS_PER_PAGE_SUBSEQUENT));
    }
  }

  // Create page chunks for history items
  const historyPageChunks = [];
  if (historyItems.length > 0) {
    historyPageChunks.push(historyItems.slice(0, ITEMS_PER_PAGE_INITIAL));
    for (let i = ITEMS_PER_PAGE_INITIAL; i < historyItems.length; i += ITEMS_PER_PAGE_SUBSEQUENT) {
      historyPageChunks.push(historyItems.slice(i, i + ITEMS_PER_PAGE_SUBSEQUENT));
    }
  }

  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Century Gothic', src: '/fonts/CenturyGothic.ttf' });

  const styles = StyleSheet.create({
    page: {
      paddingTop: 30,
      paddingBottom: 30,
      paddingHorizontal: 20,
      fontSize: 8,
      fontFamily: 'Century Gothic',
      color: '#000000',
    },
    header: {
      marginBottom: 3,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 2,
    },
    title: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 3,
      textTransform: 'uppercase',
      fontFamily: 'Roboto-Bold',
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Roboto-Bold',
      marginVertical: 5,
      paddingBottom: 2,
      borderBottom: 1,
      borderColor: '#000000',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      marginTop: 15,
      paddingBottom: 3,
    },
    grnInfo: {
      flex: 1,
      textAlign: 'left',
    },
    centerTitle: {
      flex: 2,
      textAlign: 'center',
    },
    dateInfo: {
      flex: 1,
      textAlign: 'right',
    },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
      marginTop: 12,
    },
    infoSection: {
      width: '49%',
      marginBottom: 10,
    },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      minHeight: 100,
    },
    infoHeader: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#000000',
      padding: 3,
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
    },
    infoValueInner: {
      flex: 1,
      textAlign: 'left',
    },
    tableWrapper: {
      borderLeft: 1,
      borderRight: 1,
      borderColor: '#000',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderTop: 1,
      borderBottom: 1,
      borderColor: '#000000',
      alignItems: 'center',
    },
    th: {
      padding: 3,
      fontFamily: 'Roboto-Bold',
      fontSize: 7,
      borderRight: 1,
      borderColor: '#000000',
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    td: {
      padding: 3,
      fontSize: 7,
      borderRight: 1,
      borderColor: '#000000',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 18,
    },
    row: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#000',
      alignItems: 'stretch',
      minHeight: 18,
    },

    totalBox: {
      border: 1,
      borderColor: '#000000',
      padding: 6,
      marginTop: 8,
      width: '38%',
      alignSelf: 'flex-end',
      backgroundColor: '#f9f9f9',
    },
    totalText: {
      fontFamily: 'Roboto-Bold',
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
      paddingTop: 8,
    },
    approvalTitle: {
      fontSize: 9,
      fontFamily: 'Roboto-Medium',
      marginTop: 3,
    },
    underline: {
      borderBottom: 1,
      borderColor: '#000000',
      marginTop: 5,
      width: '100%',
    },
    approvalName: {
      fontFamily: 'Roboto-Bold',
      fontSize: 10,
    },
    footer: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 7,
      paddingTop: 8,
      borderTop: '1 solid #000000',
      marginHorizontal: 30,
    },
  });

  const Header = () => (
    <View style={styles.header}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        <Image source="/logo/Simco(CMYK).png" style={{ height: 30, width: 110 }} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold' }}>
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
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 35, width: 90 }} />
      </View>
    </View>
  );

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

  const columnFlex = [0.4, 1.5, 2.5, 0.7, 0.9, 1, 1.2, 1.2, 1.5, 1.2, 1.2];
  const columnHeaders = [
    'S.No',
    'Item Code',
    'Description',
    'UOM',
    'Issued Qty',
    'Requested Qty',
    'Accepted Qty',
    'Returned Qty',
    'Remarks',
    'Store',
    'Location',
  ];

  // History table columns (with Issue Date instead of Returned Qty)
  const historyColumnFlex = [0.4, 1.5, 2.5, 0.7, 0.9, 1, 1.2, 1.2, 1.5, 1.2, 1.2];
  const historyColumnHeaders = [
    'S.No',
    'Item Code',
    'Description',
    'UOM',
    'Issued Qty',
    'Requested Qty',
    'Accepted Qty',
    'Issue Date',
    'Remarks',
    'Store',
    'Location',
  ];

  const TableHeader = ({ isFirstPage, isHistory = false }) => {
    const headers = isHistory ? historyColumnHeaders : columnHeaders;
    const flexValues = isHistory ? historyColumnFlex : columnFlex;

    return (
      <View
        style={[
          styles.tableHeader,
          {
            borderLeft: 1,
            borderRight: 1,

            marginTop: isFirstPage ? 0 : 40,
          },
        ]}
        fixed
      >
        {headers.map((col, index) => (
          <Text
            key={index}
            style={[
              styles.th,
              {
                flex: flexValues[index],
                borderRight: index === headers.length - 1 ? 0 : 1,
                borderColor: '#000000',
              },
            ]}
          >
            {col}
          </Text>
        ))}
      </View>
    );
  };

  TableHeader.propTypes = {
    isFirstPage: PropTypes.bool.isRequired,
    isHistory: PropTypes.bool,
  };

  // Helper component to render table rows
  const TableRows = ({ items, sourceArray, isHistory = false }) => {
    const flexValues = isHistory ? historyColumnFlex : columnFlex;

    return (
      <View style={styles.tableWrapper}>
        {items.map((row, rowIndex) => {
          const serialNumber = sourceArray.indexOf(row) + 1;

          return (
            <View key={rowIndex} style={styles.row}>
              <Text style={[styles.td, { flex: flexValues[0], borderRight: 1 }]}>
                {serialNumber}
              </Text>
              <Text style={[styles.td, { flex: flexValues[1], borderRight: 1 }]}>
                {row.ItemCode || 'N/A'}
              </Text>
              <Text style={[styles.td, { flex: flexValues[2], textAlign: 'left', borderRight: 1 }]}>
                {row.ItemDescription || 'N/A'}
              </Text>
              <Text style={[styles.td, { flex: flexValues[3], borderRight: 1 }]}>
                {row.UOMName || 'N/A'}
              </Text>
              <Text style={[styles.td, { flex: flexValues[4], borderRight: 1 }]}>
                {fNumber(row.IssueQty)}
              </Text>
              <Text style={[styles.td, { flex: flexValues[5], borderRight: 1 }]}>
                {fNumber(row.TotalRequestedQty) || 0}
              </Text>
              <Text style={[styles.td, { flex: flexValues[6], borderRight: 1 }]}>
                {fNumber(row.AcceptedQty) || 0}
              </Text>
              <Text style={[styles.td, { flex: flexValues[7], borderRight: 1 }]}>
                {isHistory
                  ? row.UpdatedDate
                    ? fDate(row.UpdatedDate)
                    : 'N/A'
                  : fNumber(row.ReturnQty) || 0}
              </Text>
              <Text style={[styles.td, { flex: flexValues[8], textAlign: 'left', borderRight: 1 }]}>
                {row.Remarks || 'N/A'}
              </Text>
              <Text style={[styles.td, { flex: flexValues[9], borderRight: 1 }]}>
                {row.StoreName || 'N/A'}
              </Text>
              <Text style={[styles.td, { flex: flexValues[10], borderRight: 0 }]}>
                {row.LocationName || 'N/A'}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  TableRows.propTypes = {
    items: PropTypes.array.isRequired,
    sourceArray: PropTypes.array.isRequired,
    isHistory: PropTypes.bool,
  };

  const hasRegularItems = regularPageChunks.length > 0;
  const hasHistoryItems = historyPageChunks.length > 0;

  return (
    <PDFViewer size="A3" style={{ width: '100%', height: '100vh' }}>
      <Document title={`ITEM ISSUE REPORT - ${master.IssueCode}`}>
        {regularPageChunks.map((chunk, chunkIndex) => {
          const isLastRegularPage = chunkIndex === regularPageChunks.length - 1;
          const isFirstPage = chunkIndex === 0;

          return (
            <Page key={`regular-${chunkIndex}`} size="A3" style={styles.page}>
              {isFirstPage && <Header />}

              <Footer />

              {isFirstPage && (
                <View>
                  <View style={styles.topRow}>
                    <View style={styles.grnInfo}>
                      <Text
                        style={{
                          fontFamily: 'Roboto-Bold',
                          fontSize: 9,
                          marginTop: 2,
                          textAlign: 'left',
                          textTransform: 'uppercase',
                        }}
                      >
                        Issue Code: {master.IssueCode || '-'}
                      </Text>
                    </View>
                    <View style={styles.centerTitle}>
                      <Text style={styles.title}>Item Issuance Report</Text>
                    </View>
                    <View style={styles.dateInfo}>
                      <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', marginTop: 2 }}>
                        Issue Date: {fDate(master.IssueDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoSection}>
                      <View style={styles.infoContent}>
                        <View style={styles.infoHeader}>
                          <Text style={styles.infoHeaderText}>Issuance Information</Text>
                        </View>
                        {[
                          ['Issued to Department', master.DepartmentName || '-'],
                          ['Issued to Section', master.SectionName || '-'],
                          ['Total Items', regularItems.length],
                          ['Driver Name', master?.DriverName || '-'],
                          ['Vehicle No.', master?.VehicleNo || '-'],
                        ].map(([label, value], i) => (
                          <View key={i} style={styles.infoRowInner}>
                            <Text style={styles.infoLabelInner}>{label}:</Text>
                            <Text style={styles.infoValueInner}>{value}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoContent}>
                        <View style={styles.infoHeader}>
                          <Text style={styles.infoHeaderText}>Request Information</Text>
                        </View>
                        {[
                          ['Requested Code', master.ReqCode || 'N/A'],
                          ['Requested Date', fDate(master.ReqDate) || 'N/A'],
                          ['Requested By', master.RequestedBy || 'N/A'],
                        ].map(([label, value], i) => (
                          <View key={i} style={styles.infoRowInner}>
                            <Text style={styles.infoLabelInner}>{label}:</Text>
                            <Text style={styles.infoValueInner}>{value}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.sectionTitle}>Issued Items Details</Text>
                </View>
              )}

              <TableHeader isFirstPage={isFirstPage} />
              <TableRows items={chunk} sourceArray={regularItems} />

              {isLastRegularPage && (
                <View>
                  <View style={styles.totalBox}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.totalText}>Total Issued Qty:</Text>
                      <Text style={styles.totalText}>
                        {fNumber(totalQty)} {master.UOMName || ''}
                      </Text>
                    </View>
                  </View>

                  {hasHistoryItems && (
                    <View>
                      <Text style={styles.sectionTitle}>History</Text>
                      <TableHeader isFirstPage isHistory />
                      <TableRows items={historyItems} sourceArray={historyItems} isHistory />
                    </View>
                  )}

                  <View style={styles.approvalContainer}>
                    <View style={styles.approvalRow}>
                      {[
                        ['Issued By', master.IssuedBy || '', true],
                        ['Received By', master.ReceivedBy || '', false],
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
                </View>
              )}
            </Page>
          );
        })}
      </Document>
    </PDFViewer>
  );
};

ItemIssuePDF.propTypes = {
  currentData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default ItemIssuePDF;

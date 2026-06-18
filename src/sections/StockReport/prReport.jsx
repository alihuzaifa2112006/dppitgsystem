import React, { useState, useEffect } from 'react';
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

import numberToWords from 'number-to-words';
import PropTypes from 'prop-types';
import { APP_API } from 'src/config-global';

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
    padding: 5,
    fontSize: 9,
    borderBottom: 1,
    borderColor: '#000000',
  },
  headerCell: {
    padding: 5,
    fontSize: 9,
    textAlign: 'center',
    borderBottom: 1,
    borderRight: 1,
    borderColor: '#000000',
    fontFamily: 'Roboto-Bold',
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
  totalBox: {
    border: 1,
    borderColor: '#000000',
    padding: 5,
    marginTop: 10,
    marginBottom: 15,
    width: '38%',
    alignSelf: 'flex-end',
  },
  totalText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 10,
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
  prInfo: {
    flex: 1,
    textAlign: 'left',
  },
  dateInfo: {
    flex: 1,
    textAlign: 'right',
  },
  dateBox: {
    padding: 5,
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
    marginBottom: 15,
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
  infoLabelInner: {
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  infoValueInner: {
    flex: 1,
    textAlign: 'left',
  },
  approvalContainer: {
    marginTop: 40,
  },
  approvalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  approvalColumn: {
    width: '30%',
    textAlign: 'center',
  },
  approvalBox: {
    paddingTop: 10,
  },
  approvalTitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    marginTop: 5,
  },
  underline: {
    borderBottom: 1,
    borderColor: '#000000',
    marginTop: 5,
    width: '100%',
  },
  approvalName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 12,
  },
});

const columnWidths = ['10%', '10%', '10%', '10%', '20%', '10%', '10%', '10%', '10%'];

const firstPageLimit = 25;
const otherPagesLimit = 35;

const splitRows = (rows) => {
  const chunks = [];

  if (rows.length <= firstPageLimit) {
    chunks.push(rows);
  } else {
    chunks.push(rows.slice(0, firstPageLimit));
    let remaining = rows.slice(firstPageLimit);

    while (remaining.length > 0) {
      chunks.push(remaining.slice(0, otherPagesLimit));
      remaining = remaining.slice(otherPagesLimit);
    }
  }

  return chunks;
};

const PRI = ({ PRRequestID }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${APP_API}GetPurchaseRequestDetailsById?PRRequestID=${PRRequestID}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [PRRequestID]);

  if (loading) {
    return (
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        <Document
          title={`Purchase Request - ${data?.PRCode}`}
          subject="Purchase Request Report"
          creator="CYCLO® Cloud"
          author="ITG"
        >
          <Page size="A3" style={styles.page}>
            <Text>Loading...</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  if (error) {
    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
          <Page size="A3" style={styles.page}>
            <Text>Error: {error}</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  // Format the date from the API
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totalUnitCost = data.Details.reduce((acc, item) => acc + item.PRUnitPrice, 0);
  const totalPR = data.Details.reduce((acc, item) => acc + item.PRQTY, 0);
  const totalValue = data.Details.reduce((acc, item) => acc + item.PRQTY * item.PRUnitPrice, 0);
  const chunkedItems = splitRows(data.Details);
  
  const convertMonthNumToText = (number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[number - 1];
  };

  // Header Component
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
        <View>
          <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        </View>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
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
        <View>
          <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
        </View>
      </View>
    </View>
  );

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Purchase Request - ${data.PRCode}`}
        subject="Purchase Request Report"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        <Page size="A3" style={styles.page}>
          {/* Header */}
          <Header />

          {/* Top Row with PR Info and Title */}
          <View style={styles.topRow}>
            <View style={styles.prInfo}>
              <View style={styles.dateBox}>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10, textAlign: 'center' }}>
                  PR No: {data.PRCode}
                </Text>
              </View>
            </View>
            <View style={styles.centerTitle}>
              <View style={styles.dateBox}>
                <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                  General Purchase Requisition Receipt
                </Text>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <View style={styles.dateBox}>
                <Text style={{ fontSize: 10, textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                  PR Date: {formatDate(data.PRRequestDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* PR Information Box - Full Width */}
          <View style={styles.infoContent}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>PR Information</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '50%' }}>
                {[
                  ['Requisition No.', data.PRCode],
                  ['Requisition Date', formatDate(data.PRRequestDate)],
                  ['Department', data.DepartmentName],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
              <View style={{ width: '50%' }}>
                {[
                  ['Purchase Type', data.PurchaseType],
                  ['Budget Month', convertMonthNumToText(data.BudgetMonth)],
                  ['Currency', data.Details[0]?.Currency_Name || 'N/A'],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Item Details Table */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'SL No.',
                'Item Group',
                'Category',
                'Item Code',
                'Item Description',
                'UOM',
                'Unit Cost',
                'Requisition Qty',
                'Total Value',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: columnWidths[i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 9,
                    borderRight: i !== 8 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: i > 5 ? 'center' : 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {/* Table Rows */}
            {data.Details.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                {[
                  idx + 1,
                  item.ClassName,
                  item.Inv_Cat_Name,
                  item.Itemcode,
                  item.PRItemDescription,
                  item.UOMName,
                  item.PRUnitPrice.toFixed(2),
                  item.PRQTY.toFixed(2),
                  (item.PRQTY * item.PRUnitPrice).toFixed(2),
                ].map((val, i) => (
                  <Text
                    key={i}
                    style={{
                      width: columnWidths[i],
                      fontSize: 8.5,
                      fontFamily: 'Roboto-Regular',
                      padding: 4,
                      borderRight: i !== 8 ? 1 : 0,
                      borderColor: '#000',
                      textAlign: i > 5 ? 'right' : 'center',
                    }}
                  >
                    {val}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          {/* Totals Box */}
          <View style={styles.totalBox}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Unit Cost:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {totalUnitCost.toFixed(2)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Requisition Qty:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {totalPR.toFixed(2)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Value:</Text>
              <Text
                style={{
                  ...styles.totalText,
                  textAlign: 'right',
                  color: '#555555',
                }}
              >
                {totalValue.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Approval Signatures */}
          <View style={styles.approvalContainer}>
            <View style={styles.approvalRow}>
              {/* Prepared By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{data.PreparedByName || '____________'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Prepared By</Text>
                </View>
              </View>

              {/* Recommended By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{data.lvl1_approvername || '____________'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Recommended By</Text>
                </View>
              </View>

              {/* Approved By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{data.lvl2_approvername || '____________'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Approved By</Text>
                </View>
              </View>
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

Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
  family: 'Roboto-Regular',
  src: '/fonts/Roboto-Regular.ttf',
});

export default PRI;

PRI.propTypes = {
  PRRequestID: PropTypes.any,
};
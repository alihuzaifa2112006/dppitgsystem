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
const BlowReportPDF = ({ currentData }) => {
  console.log(currentData)
  const Master = currentData;
  const Details = currentData?.Details || [];

  // ----------- Font Registration -----------
  Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

  // ----------- Calculate Totals -----------
  const totalBale = Master.Total_Bale;
  const totalWeight = Master.Total_Weight;
  const totalMCRunning = Master.Total_MC_Running || 0;
  const totalProductionHR = Master.Total_Production_HR || 0;

  // ----------- Calculate Totals from Details (Frontend Sum) -----------
  const Total_Bale_Sum = Details.reduce((sum, d) => sum + (Number(d.TotalBale) || 0), 0);
  const Total_MC_Running_Sum = Details.reduce((sum, d) => sum + (Number(d.Total_MC_Running) || 0), 0);
  const Total_Production_HR_Sum = Details.reduce((sum, d) => sum + (Number(d.Total_Production_HR) || 0), 0);
  const Total_Weight_Sum = Details.reduce((sum, d) => sum + (Number(d.TotalWeight) || 0), 0);
  const Dust_Weight_Sum = Details.reduce((sum, d) => sum + (Number(d.DustWeight) || 0), 0);
  const Dropping_Weight_Sum = Details.reduce((sum, d) => sum + (Number(d.DroppingWeight) || 0), 0);

  const uom = Details[0]?.UOMName || 'KG';

  // ----------- Group Details by Line_No -----------
  const groupedByLine = Details.reduce((acc, detail) => {
    const lineNo = detail.Line_No || 'Unknown';
    if (!acc[lineNo]) {
      acc[lineNo] = [];
    }
    acc[lineNo].push(detail);
    return acc;
  }, {});

  // ----------- Calculate Line-wise Totals -----------
  const lineTotals = {};
  Object.keys(groupedByLine).forEach(lineNo => {
    const lineDetails = groupedByLine[lineNo];
    lineTotals[lineNo] = {
      TotalBale: lineDetails.reduce((sum, d) => sum + (Number(d.TotalBale) || 0), 0),
      TotalWeight: lineDetails.reduce((sum, d) => sum + (Number(d.TotalWeight) || 0), 0),
      DustWeight: lineDetails.reduce((sum, d) => sum + (Number(d.DustWeight) || 0), 0),
      DroppingWeight: lineDetails.reduce((sum, d) => sum + (Number(d.DroppingWeight) || 0), 0),
      Total_MC_Running: lineDetails.reduce((sum, d) => sum + (Number(d.Total_MC_Running) || 0), 0),
      Total_Production_HR: lineDetails.reduce((sum, d) => sum + (Number(d.Total_Production_HR) || 0), 0),
    };
  });

  // ----------- Styles -----------
  const styles = StyleSheet.create({
    page: {
      paddingTop: 8,
      paddingBottom: 50,
      paddingHorizontal: 25,
      fontSize: 10,
      fontFamily: 'Century Gothic',
      color: '#000000',
    },
    header: {
      marginBottom: 8,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 6,
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
      fontSize: 13,
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
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 6,
    },
    grnInfo: { flex: 1, textAlign: 'left' },
    centerTitle: { flex: 2, textAlign: 'center' },
    dateInfo: { flex: 1, textAlign: 'right' },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    lineBoxContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    lineBox: {
      width: '48%',
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      marginBottom: 10,
      padding: 8,
    },
    lineBoxHeader: {
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 5,
      marginBottom: 8,
    },
    lineBoxTitle: {
      fontFamily: 'Roboto-Bold',
      fontSize: 11,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    lineTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 2,
      borderBottom: 1,
      borderColor: '#f0f0f0',
    },
    lineTotalLabel: {
      fontFamily: 'Roboto-Medium',
      fontSize: 9,
    },
    lineTotalValue: {
      fontFamily: 'Roboto-Bold',
      fontSize: 9,
      textAlign: 'right',
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
      fontSize: 12,
    },
    infoRowInner: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#e0e0e0',
      paddingVertical: 3,
      paddingHorizontal: 8,
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
      left: 25,
      right: 25,
      textAlign: 'center',
      fontSize: 9,
      paddingTop: 8,
      borderTop: '1 solid #000000',
    },
  });


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


  const LineBox = ({ lineNo, totals }) => (
    <View style={styles.lineBox}>
      <View style={styles.lineBoxHeader}>
        <Text style={styles.lineBoxTitle}>Line {lineNo}</Text>
      </View>

      {[
        ['Total Bale', totals.TotalBale, ''],
        ['Total Weight', totals.TotalWeight, uom],
        ['Dust Weight', totals.DustWeight, uom],
        ['MC Running', totals.Total_MC_Running, ''],
        ['Production/HR', totals.Total_Production_HR, ''],
      ].map(([label, value, unit], i) => (
        <View key={i} style={styles.lineTotalRow}>
          <Text style={styles.lineTotalLabel}>{label}:</Text>
          <Text style={styles.lineTotalValue}>
            {fNumber(value || 0)} {unit}
          </Text>
        </View>
      ))}
    </View>
  );
  // ==================== ADDED LineBox PROPTYPES HERE (FIX for no-undef) ====================
  LineBox.propTypes = {
    lineNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    totals: PropTypes.shape({
      TotalBale: PropTypes.number,
      TotalWeight: PropTypes.number,
      DustWeight: PropTypes.number,
      Total_MC_Running: PropTypes.number,
      Total_Production_HR: PropTypes.number,
    }).isRequired,
  };


  // ----------- Collect All Waste Details -----------
  const allWasteDetails = [];
  // Check if waste details are at Master level
  if (Master.WasteDetails && Array.isArray(Master.WasteDetails) && Master.WasteDetails.length > 0) {
    allWasteDetails.push(...Master.WasteDetails);
  } else if (Master.ItemWaste && Array.isArray(Master.ItemWaste) && Master.ItemWaste.length > 0) {
    allWasteDetails.push(...Master.ItemWaste);
  } else {
    // Collect from Details if not at Master level
    Details.forEach((detail) => {
      if (detail.WasteDetails && detail.WasteDetails.length > 0) {
        detail.WasteDetails.forEach((waste) => {
          allWasteDetails.push(waste);
        });
      }
    });
  }

  // ----------- Split Details into chunks of 4 per page -----------
  const detailsPerPage = 4;
  const detailChunks = [];
  for (let i = 0; i < Details.length; i += detailsPerPage) {
    detailChunks.push(Details.slice(i, i + detailsPerPage));
  }

  // ----------- Render Single Detail Row (without header) -----------
  const renderDetailRow = (detail, idx) => {
    // Logic: If ReqNo/ReqCode exists, show it, otherwise show TransNo/TransferNo
    const reqNo = detail.ReqNo || detail.ReqCode || '';
    const transNo = detail.TransNo || detail.TransferNo || '';
    const displayValue = reqNo || transNo || detail.ChallanNo || '-';

    return (
      <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
        <Text style={{ width: '33.33%', padding: 4, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
          {displayValue}
        </Text>
        <Text style={{ width: '66.67%', padding: 4, fontSize: 9, textAlign: 'left' }}>
          {detail.InItemName || '-'}
        </Text>
      </View>
    );
  };

  // ----------- Render Single Waste Row (without header) -----------
  const renderWasteRow = (waste, idx) => (
    <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
      <Text style={{ width: '33.33%', padding: 4, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'left' }}>
        {waste.WasteSubCatName || '-'}
      </Text>
      <Text style={{ width: '44.44%', padding: 4, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'left' }}>
        {waste.WasteItemName || '-'}
      </Text>
      <Text style={{ width: '22.23%', padding: 4, fontSize: 9, textAlign: 'right' }}>
        {waste.WasteQty ? fNumber(waste.WasteQty) : '-'}
      </Text>
    </View>
  );

  // ----------- Render Single Detail Component (for waste details) -----------
  const renderDetail = (detail, idx) => (
    <View key={idx} style={{ marginBottom: 8 }} wrap={false}>

      {/* Waste Details Section */}
      {detail.WasteDetails && detail.WasteDetails.length > 0 && (
        <View style={{ marginTop: 6, marginLeft: 10 }}>
          <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 9, marginBottom: 3, textDecoration: 'underline' }}>
            Waste Details
          </Text>
          <View style={{ border: 1, borderColor: '#666' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5' }}>
              {[
                'Waste Sub Category',
                'Waste Item Name',
                'Waste Qty',
                'Waste %',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['30%', '40%', '15%', '15%'][i],
                    padding: 3,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: i !== 3 ? 1 : 0,
                    borderColor: '#666',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {detail.WasteDetails.map((waste, wasteIdx) => (
              <View key={wasteIdx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#666' }}>
                <Text style={{ width: '30%', padding: 3, fontSize: 8, borderRight: 1, textAlign: 'left', borderColor: '#666' }}>
                  {waste.WasteSubCatName || '-'}
                </Text>
                <Text style={{ width: '40%', padding: 3, fontSize: 8, borderRight: 1, textAlign: 'left', borderColor: '#666' }}>
                  {waste.WasteItemName || '-'}
                </Text>
                <Text style={{ width: '15%', padding: 3, fontSize: 8, borderRight: 1, textAlign: 'right', borderColor: '#666' }}>
                  {waste.WasteQty ? fNumber(waste.WasteQty) : '-'}
                </Text>
                <Text style={{ width: '15%', padding: 3, fontSize: 8, textAlign: 'right' }}>
                  {waste.WastePercent ? `${fNumber(waste.WastePercent)}%` : '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`PRODUCTION REPORT - ${Master.Line_No}`}>
        {/* First Page - Summary */}
        <Page size="A3" style={styles.page}>
          <Header />

          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  marginTop: 5,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Blowroom No: {Master.PDONO || Master.DepartmentName || '-'}
              </Text>
            </View>
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                Daily Blowroom Production Report
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Roboto-Bold',
                  marginTop: 3,
                }}
              >
                Report Date: {fDate(Master.RptDate)}
              </Text>
            </View>
          </View>

          <View style={[styles.infoContainer, { width: '100%' }]}>
            <View style={[styles.infoSection, { width: '100%' }]}>
              <View style={[styles.infoContent, { width: '100%' }]}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Produced Item Information</Text>
                </View>

                <View style={{ width: '100%' }}>
                  {[
                    [
                      ['Produced Item ', Master.OutItemName || '-', false],
                      ['Total Production HR', fNumber(totalProductionHR), false],
                    ],
                    [
                      ['Total Weight', fNumber(totalWeight), true],
                      ['Line No', Master.Line_No || '-', false],
                    ],
                    [
                      ['Total Time', Master.Total_Time ? fDateTime(Master.Total_Time) : '-', false],
                      ['Shift', Master.ShiftName || 'N/A', false],
                    ],
                    [
                      ['Total MC Running', fNumber(totalMCRunning), false],
                      ['Total Bale', fNumber(totalBale), false],
                    ],
                  ].map(([leftItem, rightItem], rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', width: '100%', borderBottom: 1, borderColor: '#e0e0e0' }}>
                      {/* Left Cell */}
                      <View style={{ width: '50%', flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 8, borderRight: 1, borderColor: '#e0e0e0' }}>
                        <Text style={[styles.infoLabelInner, { flex: 1 }]}>{leftItem[0]}:</Text>
                        <Text style={[styles.infoValueInner, { flex: 1, textAlign: 'left' }]}>
                          {leftItem[1] ? `${leftItem[1]}${leftItem[2] && uom ? ` ${uom}` : ''}` : '-'}
                        </Text>
                      </View>
                      {/* Right Cell */}
                      <View style={{ width: '50%', flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 8 }}>
                        <Text style={[styles.infoLabelInner, { flex: 1 }]}>{rightItem[0]}:</Text>
                        <Text style={[styles.infoValueInner, { flex: 1, textAlign: 'left' }]}>
                          {rightItem[1] ? `${rightItem[1]}${rightItem[2] && uom ? ` ${uom}` : ''}` : '-'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Received Item Information</Text>

          {/* Single Table for All Details */}
          {detailChunks[0] && detailChunks[0].length > 0 && (
            <View style={{ border: 1, borderColor: '#000', marginTop: 5 }}>
              {/* Table Header */}
              <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
                {[
                  'Req No/Transfer No',
                  'Received Item',
                ].map((col, i) => (
                  <Text
                    key={col}
                    style={{
                      width: ['33.33%', '66.67%'][i],
                      padding: 4,
                      fontFamily: 'Roboto-Bold',
                      fontSize: 9,
                      borderRight: i !== 1 ? 1 : 0,
                      borderColor: '#000',
                      textAlign: 'center',
                    }}
                  >
                    {col}
                  </Text>
                ))}
              </View>
              {/* Table Rows */}
              {detailChunks[0].map((detail, idx) => renderDetailRow(detail, idx))}
            </View>
          )}

     
          {allWasteDetails && allWasteDetails.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Produced Item Waste</Text>
              <View style={{ border: 1, borderColor: '#000', marginTop: 5 }}>
                {/* Table Header */}
                <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
                  {[
                    'Waste Type',
                    'Waste  Name',
                    'Waste Qty',
                  ].map((col, i) => (
                    <Text
                      key={col}
                      style={{
                        width: ['33.33%', '44.44%', '22.23%'][i],
                        padding: 4,
                        fontFamily: 'Roboto-Bold',
                        fontSize: 9,
                        borderRight: i !== 2 ? 1 : 0,
                        borderColor: '#000',
                        textAlign: 'center',
                      }}
                    >
                      {col}
                    </Text>
                  ))}
                </View>
                {/* Table Rows */}
                {allWasteDetails.map((waste, idx) => renderWasteRow(waste, idx))}
              </View>
            </>
          )}

          {/* Remarks Box */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 10, padding: 8, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>
                Remarks:
              </Text>
              <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 10, flex: 1, textAlign: 'right', marginLeft: 10 }}>
                {Master.Remarks || '-'}
              </Text>
            </View>
          </View>

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
        </Page>

        {/* Details Pages - 4 details per page (starting from chunk 1, since chunk 0 is on first page) */}
        {detailChunks.slice(1).map((chunk, pageIdx) => {
          const startIdx = (pageIdx + 1) * detailsPerPage;
          return (
            <Page key={pageIdx + 1} size="A3" style={styles.page}>
              <Header />

              <View style={styles.topRow}>
                <View style={styles.grnInfo}>
                  <Text
                    style={{
                      fontFamily: 'Roboto-Bold',
                      fontSize: 10,
                      marginTop: 5,
                      textAlign: 'left',
                      textTransform: 'uppercase',
                    }}
                  >
                    PDONO: {Master.PDONO || Master.DepartmentName || '-'}
                  </Text>
                </View>
                <View style={styles.centerTitle}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: 'Roboto-Bold',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      marginBottom: 5,
                    }}
                  >
                    Blowroom Production Report
                  </Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: 'Roboto-Bold',
                      marginTop: 3,
                    }}
                  >
                    Report Date: {fDate(Master.RptDate)}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Received Item Information</Text>

              {/* Single Table for All Details */}
              {chunk && chunk.length > 0 && (
                <View style={{ border: 1, borderColor: '#000', marginTop: 5 }}>
                  {/* Table Header */}
                  <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
                    {[
                      'Req No/Transfer No',
                      'Received Item ',
                    ].map((col, i) => (
                      <Text
                        key={col}
                        style={{
                          width: ['33.33%', '66.67%'][i],
                          padding: 4,
                          fontFamily: 'Roboto-Bold',
                          fontSize: 9,
                          borderRight: i !== 1 ? 1 : 0,
                          borderColor: '#000',
                          textAlign: 'center',
                        }}
                      >
                        {col}
                      </Text>
                    ))}
                  </View>
                  {/* Table Rows */}
                  {chunk.map((detail, idx) => renderDetailRow(detail, startIdx + idx))}
                </View>
              )}

              {/* Remarks Box */}
              <View style={{ border: 1, borderColor: '#000', marginTop: 10, marginBottom: 10, padding: 8, width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10 }}>
                    Remarks:
                  </Text>
                  <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 10, flex: 1, textAlign: 'right', marginLeft: 10 }}>
                    {Master.Remarks || '-'}
                  </Text>
                </View>
              </View>

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
            </Page>
          );
        })}
      </Document>
    </PDFViewer>
  );
};

// ==================== PROPTYPES ====================
BlowReportPDF.propTypes = {
  currentData: PropTypes.object.isRequired,
};

export default BlowReportPDF;
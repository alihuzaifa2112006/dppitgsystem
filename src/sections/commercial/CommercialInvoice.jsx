// components/Cyclo.js
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
import numberToWords from 'number-to-words';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 10, // reserve space for footer
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
  },

  title: {
    textDecoration: 'underline',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
  },
  tableHeader: {
    borderTop: 1,
    flexDirection: 'row',
    backgroundColor: '#eee',
    fontWeight: 'bold',
    fontSize: 7,
    fontFamily: 'Roboto-Bold',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    padding: 3,
    fontSize: 9,
    textAlign: 'center',
    borderBottom: 1,
    borderLeft: 1,
    borderColor: '#000',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: -50,
    left: 0,
    right: 0,
    textAlign: 'right',
    color: 'black',
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

const columnWidths = ['50%', '15%', '15%', '20%'];

const items = [
  {
    orderId:
      'Twisted Yarn CYCLO Recycle Cotton Blended Yarn 30/250% Cyclo Recycled Cotton 50% Recycled Polyester OELight Grey C48', // Order ID
    yarnType: '940.00', // Yarn Type
    count: '1.8000', // Count
    composition: '1,692.00', // Composition
    // Order Qty
  },
  {
    orderId:
      'Twisted Yarn CYCLO Recycle Cotton Blended Yarn 30/250% Cyclo Recycled Cotton 50% Recycled Polyester OELight Grey C48', // Order ID
    yarnType: '940.00', // Yarn Type
    count: '1.8000', // Count
    composition: '1,692.00', // Composition
    // Order Qty
  },
];

const MstData = {
  InvDate: '12-12-2023',
  InvNo: 'INV001',
  exportRegNo: '123456',
  ExportDate: '12-12-2023',
  LcDetails: {
    LcNo: 'LC001',
    LcDate: '12-12-2023',
    AmendmentDetails: [
      {
        AmendmentNo: 'A001',
        AmendmentDate: '15-12-2023',
      },
      {
        AmendmentNo: 'A002',
        AmendmentDate: '15-12-2023',
      },
    ],
  },
  issuingBank: 'Bank of America, New York, USA',
  NegotiatingBank: 'Bank of America, New York, USA',
  buyer: 'YOUR FASHOIN SWEATER LTD',
  acccountrisk:
    'PLOT NO. 126, 1230, 1276GILARCHALA, MASTERBARI, SRIPUR, GAZIPUR-1740, BANGLADESH. IRC NUMBER :260326120171820, BIN NO.000270725-0103',
  notifyParty:
    'PLOT NO. 126, 1230, 1276GILARCHALA, MASTERBARI, SRIPUR, GAZIPUR-1740, BANGLADESH. IRC NUMBER :260326120171820, BIN NO.000270725-0103',
  bankAddress:
    'MTB INTERNATIONAL TRADE SERVICES, MOTIJHEEL SUB CENTRE, WW TOWER (5THFLOOR), 68, MOTIJHEEL C/A, DHAKA-1000, BANGLADESH',
  POL: 'CHITTAGONG, BANGLADESH',
  FinalDes: 'DUBAI, U.A.E',
  Origin: 'BANGLADESH',
  DelieveryTerms: 'CIF',
  ContractNo:
    'YFL00098 DATED.05-05-2025, GARMENTS QUANTITY : 99,450 PCS (+/- 5 PCT.) MENSCARDIGAN AND KNITTED PONCHO',
  NetWeight: '1,910.00 ',
  UOM: 'lbs',
  GrossWeight: '2,100.00',
  Measurement: '0.50 X 0.50 X 0.50',
  Exporter: 'SIMCO SPINNING & TEXTILES LTD.',
  PIDetails: [
    { PI_NO: 'PI001', PI_Date: '12-12-2023' },
    { PI_NO: 'PI002', PI_Date: '15-12-2023' },
    { PI_NO: 'PI002', PI_Date: '15-12-2023' },
  ],
};

const totalQuantity = items.reduce(
  (acc, item) => acc + parseInt(item.yarnType.replace(/,/g, ''), 10),
  0
);
const totalAmount = items.reduce(
  (acc, item) => acc + parseFloat(item.composition.replace(/,/g, '')),
  0
);
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
const CommercialInvoice = ({ currentData }) => {
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

  const chunkedItems = splitRows(currentData.items);

  const convertAmountToWords = (amount, currency = 'USD') => {
    const [whole, decimal] = amount.toFixed(2).split('.');
    const wholeWords = numberToWords.toWords(Number(whole)).toUpperCase();
    const decimalWords = numberToWords.toWords(Number(decimal)).toUpperCase();

    if (currency === 'USD') {
      return `SAY US DOLLAR: ${wholeWords} DOLLARS AND ${decimalWords} CENTS ONLY`;
    }
    // eslint-disable-next-line
    else if (currency === 'BDT' || currency === 'TAKA') {
      return `SAY BANGLADESHI TAKA: ${wholeWords} TAKA AND ${decimalWords} POISA ONLY`;
    } else {
      return `${wholeWords} AND ${decimalWords}`; // fallback
    }
  };

  return (
    <PDFViewer style={{ width: '100%', height: '80vh', marginTop: 5 }}>
      <Document title="Commercial Invoice">
        <Page size="B4" style={styles.page}>
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
              Telephone:<Text> +88 02 55033401,+88 02 55033401, +88 02 55033402. </Text>Email:
              <Text> info@simcobangladesh.com</Text>
            </Text>
          </View>

          <View
            style={{
              alignSelf: 'center',
              textAlign: 'center',
              textDecoration: 'underline',
              fontSize: 15,
              fontFamily: 'Roboto-Bold',
            }}
          >
            <Text>Commercial Invoice</Text>
          </View>

          <View
            style={{ flexDirection: 'row', gap: 15, marginTop: 10, fontFamily: 'Roboto-Regular' }}
          >
            <View style={{ width: '35%' }}>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>SHIPPER / EXPORTER </Text>
              <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>
                Simco Spinning and Textiles Limited
              </Text>
              <Text>
                House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh. T: +88
                02 55033401, +88 02 55033402. E: info@simcobangladesh.com
              </Text>
              <Text>
                Factory: Mouza: Dhamshur, Union: Mollikbari, P.O: Hajir Bazar, P.S: Bhaluka, Dist.:
                Mymensingh, Bangladesh
              </Text>
            </View>

            <View style={{ width: '32%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>
                  INVOICE NO. & DATE :
                </Text>
                <View style={{ flexDirection: 'row', gap: 30 }}>
                  <Text>{currentData?.InvNo || '-'}</Text>
                  <Text>{currentData.InvDate || '-'}</Text>
                </View>
              </View>
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>
                  EXPORT REGN. NO. & DATE :
                </Text>
                <View style={{ flexDirection: 'row', gap: 30 }}>
                  <Text>{currentData.exportRegNo || '-'}</Text>
                  <Text>{currentData.ExportRegDate || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={{ width: '33%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>L/C NO. & DATE :</Text>
                <View style={{ flexDirection: 'row', gap: 30 }}>
                  <Text>{currentData.LcDetails.LcNo || '-'}</Text>
                  <Text>{currentData.LcDetails.LcDate || '-'}</Text>
                </View>
                <View>
                  {currentData.LcDetails.AmendmentDetails &&
                    currentData.LcDetails.AmendmentDetails.length > 0 &&
                    currentData.LcDetails.AmendmentDetails.map((amendment, index) => (
                      <View key={index} style={{ flexDirection: 'row', gap: 30, marginTop: 5 }}>
                        <Text>Amendment No: {amendment.AmendmentNo || '-'}</Text>
                        <Text>Date: {amendment.AmendmentDate || '-'}</Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          </View>

          <View
            style={{ flexDirection: 'row', gap: 15, marginTop: 10, fontFamily: 'Roboto-Regular' }}
          >
            <View style={{ width: '35%' }}>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>
                FOR ACCOUNT & RISK OF :
              </Text>
              <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{currentData.buyer}</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Roboto-Regular' }}>
                {currentData.acccountrisk}
              </Text>
            </View>

            <View style={{ width: '32%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>NOTIFY PARTY :</Text>
                <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{currentData.buyer}</Text>
                <Text style={{ fontSize: 9, fontFamily: 'Roboto-Regular' }}>
                  {currentData.notifyParty}
                </Text>
              </View>
            </View>

            <View style={{ width: '33%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>L/C ISSUING BANK :</Text>

                <Text style={{ fontFamily: 'Roboto-Bold' }}>{currentData.issuingBank}</Text>
                <Text style={{ fontFamily: 'Roboto-Regular' }}>{currentData.bankAddress}</Text>
              </View>
            </View>
          </View>

          <View
            style={{ flexDirection: 'row', gap: 15, marginTop: 10, fontFamily: 'Roboto-Regular' }}
          >
            <View style={{ width: '35%' }}>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>PORT OF LOADING </Text>
              <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{currentData.POL}</Text>
              <Text>
                Origin : <Text>{currentData.Origin}</Text>
              </Text>
              <Text>
                Delievery Terms : <Text>{currentData.DelieveryTerms}</Text>
              </Text>
            </View>

            <View style={{ width: '32%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>FINAL DESTINATION :</Text>
                <View style={{ flexDirection: 'row', gap: 30 }}>
                  <Text style={{ fontSize: 9 }}>{currentData.FinalDes}</Text>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>
                  EXPORT LC / CONTRACT NO. :
                </Text>
                <View style={{ flexDirection: 'row', gap: 30 }}>
                  <Text style={{ fontSize: 9 }}>{MstData.ContractNo}</Text>
                </View>
              </View>
            </View>

            <View style={{ width: '33%' }}>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>NEGOTIATING BANK :</Text>
                <View>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>{currentData.NegotiatingBank}</Text>
                  <Text style={{ fontSize: 9 }}>{currentData.NegotiatingbankAddress}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '30%' }}>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', marginTop: 10 }}>
                SHIPPING MARKS & NO.{' '}
              </Text>
              <View style={{ gap: 10 }}>
                <View style={{ width: '100%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>MAIN MARK :</Text>
                  <Text>
                    IMPORTER : <Text>{currentData.buyer}</Text>
                  </Text>
                  <Text>{currentData.acccountrisk}</Text>
                  <Text>
                    NET WEIGHT : <Text>{currentData.NetWeight}</Text>
                  </Text>
                  <Text>
                    GROSS WEIGHT : <Text>{currentData.GrossWeight}</Text>
                  </Text>
                  <Text>
                    MEASUREMENT : <Text>{currentData.Measurement}</Text>
                  </Text>
                </View>
                <View style={{ width: '100%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>SIDE MARK :</Text>
                  <Text>
                    EXPORTER : <Text>{currentData.buyer}</Text>
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 20, marginBottom: 20, width: '70%' }}>
              {chunkedItems.map((chunk, chunkIndex) => (
                <View key={chunkIndex} wrap={false}>
                  <View style={styles.tableHeader} wrap={false}>
                    {[
                      { label: 'DESCRIPTION OF GOODS', fontSize: 9 },
                      { label: 'QUANTITY', fontSize: 9 },
                      { label: 'UNIT PRICE ', fontSize: 9 },
                      { label: 'TOTAL AMOUNT', fontSize: 9 },
                    ].map((col, i) => (
                      <View
                        key={col.label}
                        style={{
                          ...styles.cell,
                          width: columnWidths[i],
                          borderLeft: 1,
                          borderRight: i === 3 ? 1 : 0,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: col.fontSize,
                            fontWeight: 'bold',
                            marginVertical: 'auto',
                          }}
                        >
                          {col.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View
                    style={[styles.tableRow, { borderBottom: 1, borderLeft: 1, borderRight: 1, justifyContent: 'space-around', padding: 3 }]}
                  >

                    <Text> {currentData.Description || "N/A"} </Text>
                    <Text> HS Code : {currentData.HSCode}</Text>

                  </View>

                  {chunk.map((item, idx) => (
                    <View key={idx} style={styles.tableRow} wrap={false}>
                      {[
                        item.Desc,
                        // eslint-disable-next-line
                        item.Quantity + ' ' + item.UOMSymbol,
                        // eslint-disable-next-line
                        item.Currency + '  ' + item.Price,
                        // eslint-disable-next-line
                        item.Currency + '  ' + item.Amount,
                      ].map((val, i) => (
                        <Text
                          key={i}
                          style={{
                            ...styles.cell,
                            width: columnWidths[i],
                            borderLeft: 1,

                            borderRight: i === 3 ? 1 : 0,
                          }}
                        >
                          {val}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.tableRow}>
                {[
                  `(Open End Yarn)
                             As Per Proforma Invoice No.
                              ${currentData.PIDetails.map(
                    (pi) => ` ${pi.PI_NO} Dated: ${fDate(pi.PI_Date)}`
                  ).join(', ')}
                            `,
                  '',
                  '',
                  '',
                ].map((val, i) => (
                  <Text
                    key={i}
                    style={{
                      ...styles.cell,
                      width: columnWidths[i],
                      borderLeft: i === 0 ? 1 : 0,
                      borderRight: i === 3 ? 1 : 0,
                      fontWeight: 'bold',
                    }}
                  >
                    {val}
                  </Text>
                ))}
              </View>
              {/* Total row */}
              <View style={styles.tableRow}>
                {[
                  'Total',
                  `${currentData?.totalQuantity.toLocaleString()} ${currentData.items[0].UOMSymbol
                  }`,
                  '',
                  ` ${currentData.items[0].Currency} ${currentData?.totalAmount.toLocaleString()}`,
                ].map((val, i) => (
                  <Text
                    key={i}
                    style={{
                      ...styles.cell,
                      width: columnWidths[i],
                      borderLeft: 1,
                      borderRight: i === 3 ? 1 : 0,
                      fontWeight: i === 0 || i === 1 || i === 3 ? 'bold' : 'normal',
                    }}
                  >
                    {val}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Total Summary Section */}
          <View style={{ marginTop: 10, border: 1, padding: 10 }} wrap={false}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 5,
                textAlign: 'center',
                fontFamily: 'Roboto-Bold',
              }}
            >
              Total Summary :
            </Text>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}
            >
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>Total No. Of Bags :</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>{currentData.totalBags} BAGS</Text>
            </View>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}
            >
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>Total Only :</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                {' '}
                {currentData?.totalQuantity.toLocaleString()} {currentData.items[0].UOMSymbol}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}
            >
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>Total Net.Wt.:</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                {currentData.NetWeight}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}
            >
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>Total Gr.Wt.:</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                {currentData.GrossWeight}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>Total Volume:</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                {currentData.totalVolume}
              </Text>
            </View>
          </View>
          <View style={{ fontSize: 11, fontFamily: 'Roboto-Bold' }}>
            <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 9, marginTop: 10 }}>
              <Text>
                {convertAmountToWords(currentData?.totalAmount, currentData?.items.CurrencyName)}
              </Text>
            </Text>
            <Text style={{ fontFamily: 'Roboto-Bold', marginTop: 5 }}>
              WE CERTIFY THAT THE MERCHANDISE ARE OF {currentData.Origin} ORIGIN.
            </Text>
          </View>
          <Footer />
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
  family: 'Century Gothic',
  src: '/fonts/Century Gothic.ttf',
});
export default CommercialInvoice;

CommercialInvoice.propTypes = {
  currentData: PropTypes.any,
};

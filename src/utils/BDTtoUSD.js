export async function convertBDTtoUSD(bdtAmount) {
  const apiUrl = 'https://latest.currency-api.pages.dev/v1/currencies/bdt.json';

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const usdRate = data?.bdt?.usd;

    if (typeof usdRate !== 'number') {
      throw new Error('USD rate not found in the response');
    }

    const usdAmount = bdtAmount * usdRate;
    return usdAmount;
  } catch (error) {
    console.error('Error converting BDT to USD:', error.message);
    return null;
  }
}

// convert USD to BDT
export async function convertUSDtoBDT(usdAmount) {
  const apiUrl = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const bdtRate = data?.usd?.bdt;
    console.log('bdtRate', bdtRate);
    if (typeof bdtRate !== 'number') {
      throw new Error('BDT rate not found in the response');
    }
    const bdtAmount = usdAmount * bdtRate;
    return bdtAmount;
  } catch (error) {
    console.error('Error converting USD to BDT:', error.message);
    return null;
  }
}

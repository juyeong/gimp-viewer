import axios, { AxiosResponse, AxiosError }  from 'axios';

interface ICoin {
  name: string;
}
interface IExchange {
  name: string;
  currency: ICurrency;
}
interface ICurrency {
  name: string;
}

interface ICoinPrice {
  exchange: IExchange;
  coin: ICoin;
  price: number;
  time: number;
  currency: ICurrency;
}

interface IResponse {
  exchange: string;
  coin: string;
  price: number;
  time: number;
  currency: string;
}

// // currency
const KRW: ICurrency = { name: "krw" }
const USD: ICurrency = { name: "usd" }
const JPY: ICurrency = { name: "jpy" }
const CURRENCIES = [KRW, USD, JPY]
//exchange
const BITFINEX: IExchange = { name: "bitfinex", currency: USD }
const BITHUMB: IExchange = { name: "bithumb", currency: KRW }
const COINONE: IExchange = { name: "coinone", currency: KRW }
const UPBIT: IExchange = { name: "upbit", currency: KRW }
const EXCHANGES = [BITFINEX, BITHUMB, COINONE, UPBIT]
//coin
const BTC: ICoin = { name: "btc" }
const ETH: ICoin = { name: "eth" }
const XRP: ICoin = { name: "xrp" }
const LTC: ICoin = { name: "ltc" }
const QTUM: ICoin = { name: "qtum" }
const DASH: ICoin = { name: "dash" }
const ETC: ICoin = { name: "etc" }
const BCH: ICoin = { name: "bch" }
const XMR: ICoin = { name: "xmr" }
const ZEC: ICoin = { name: "zec" }
const BTG: ICoin = { name: "btg" }
const EOS: ICoin = { name: "eos" }
const IOTA: ICoin = { name: "iota" }
const SNT: ICoin = { name: "snt" }
const NEO: ICoin = { name: "neo" }
const ADA: ICoin = { name: "ada" }
const XLM: ICoin = { name: "xlm" }
const COINS = [BTC,ETH,XRP,LTC,QTUM,DASH,ETC,BCH,XMR,ZEC,BTG,EOS,IOTA,SNT,NEO,ADA,XLM]


function ready(fn: (EventListenerOrEventListenerObject?: any, useCapture?: boolean) => void) {
  if ((document as any).attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function main() {
  let rate: string = 'translate';
  let time: number = 10;
  let priceData: ICoinPrice[] = [];
  let refreshTime: number = 60;
  let loaded = false;
  let currencyRate: number = 0;

  function setRate(newRate: string) {
    switch(newRate) {
      case 'gimp':
      case 'translate':
        rate = newRate;
        break;
      case 'change':
        rate = 'translate';
    }
  }

  function getRate() {
    return rate;
  }

  function setCurrencyRate(rate: number) {
    currencyRate = rate;
  }

  function getCurrencyRate() {
    return currencyRate;
  }

  function setTime(newTime: number) {
    switch(newTime) {
      case 10:
      case 30:
      case 60:
      case 720:
          time = newTime;
          break;
    }
  }

  function getTime() {
    return time;
  }

  function setPriceData(newPriceData: IResponse[]) {
    priceData = newPriceData.map((item: IResponse) => getCoinPrice(item))
  }

  function getPriceData() {
    return priceData;
  }

  function getRefreshTime() {
    return refreshTime;
  }

  function decRefreshTime() {
    refreshTime = refreshTime - 1;
  }

  function resetRefreshTime() {
    refreshTime = 60;
  }

  function getCell(exchange: IExchange, coin: ICoin): HTMLTableRowElement {
    return document.querySelector(`.${coin.name}-${exchange.name}`);
  }

  function getExchange(name: string) {
    return EXCHANGES.find(exchange => {
      return exchange.name === name
    });
  }

  function getCoin(name: string) {
    return COINS.find(coin => {
      return coin.name === name
    });
  }

  function getCurrency(name: string) {
    return CURRENCIES.find(currency => {
      return currency.name === name
    });
  }

  function getCoinPrice(response: IResponse) {
    let value: ICoinPrice = {
      exchange: getExchange(response.exchange),
      coin: getCoin(response.coin),
      price: response.price,
      time: response.time,
      currency: getCurrency(response.currency)
    };
    return value;
  }

  function getPrice(exchange: IExchange, coin: ICoin, time: number) {
    let json: ICoinPrice = getPriceData().find(item => {
        return item.exchange === exchange && item.coin === coin && item.time == time
      });
    return json && json.price || 0 // ? how to handle undefined
  }

  function formatPrice(price: number, currency: string) {
    let formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });

    return formatter.format(price);
  }

  function render() {
    COINS.forEach(coin => {
      EXCHANGES.forEach(exchange => {
        let cell = getCell(exchange, coin);
        if (cell != null) {
          let price = getPrice(exchange, coin, 0);
          if (price == 0) {
            cell.innerText = '-';
          } else {
            let time = getTime();
            let lastPrice = getPrice(exchange, coin, time);
            if (exchange === BITFINEX) {
              renderChanges(exchange, cell, price, lastPrice);
            } else {
              let rate = getRate();
              if (rate === 'gimp') {
                let bitfinexPrice = getPrice(BITFINEX, coin, 0);
                let bitfinexLastPrice = getPrice(BITFINEX, coin, time);
                renderGimp(exchange, cell, price, lastPrice, bitfinexPrice, bitfinexLastPrice);
              } else if (rate === 'translate') {
                renderChanges(exchange, cell, price, lastPrice);
              }
            }
          }
        }
      });
    });
    $(function () {
      $('[data-toggle="popover"]').popover({ 'trigger': 'hover', })
    })
  }

  function renderChanges(exchange: IExchange, cell: HTMLTableRowElement, price: number, lastPrice: number) {
    let priceChange = price / lastPrice - 1;
    if (lastPrice != 0 && price != 0) {
      let fontColor = getFontColor(priceChange);
      cell.innerHTML = `<span style="color: ${fontColor};">${formatPrice(price, exchange.currency.name)}</span><br><small data-toggle="popover" data-placement="bottom" data-content="${formatPrice(lastPrice, exchange.currency.name)}">${(100 * priceChange).toFixed(2)}%</small>`;
    } else {
      cell.innerHTML = `<span>${formatPrice(price, exchange.currency.name)}</span>`;
    }
  }

  function renderGimp(exchange: IExchange, cell: HTMLTableRowElement, price: number, lastPrice: number, basePrice: number, baseLastPrice: number) {
    if (price == 0) { return; }
    let currencyRate = getCurrencyRate();
    let priceChange = price / lastPrice - 1;
    let fontColor = getFontColor(priceChange);
    if (basePrice == 0 || currencyRate == 0) {
      cell.innerHTML = `<span style="color: ${fontColor};">${formatPrice(price, exchange.currency.name)}</span>`;
    } else {
      let gimp = price / (basePrice * currencyRate) - 1;
      let lastGimp = lastPrice / (baseLastPrice * currencyRate) - 1;
      let gimpChange = (100 * (gimp - lastGimp))
      let formattedGimpChange = gimpChange > 0 ? `+${gimpChange.toFixed(2)}%` : `${gimpChange.toFixed(2)}%`
      cell.innerHTML = `<span style="color: ${fontColor};">${formatPrice(price, exchange.currency.name)}</span><br><small  data-toggle="popover" data-placement="bottom" data-content="${formattedGimpChange}">${(100 * gimp).toFixed(2)}%</small>`;
    }
  }

  function getFontColor(priceChange: number) {
    if (priceChange > 0) {
      return 'red';
    } else if (priceChange < 0) {
      return 'blue';
    } else {
      return 'black';
    }
  }

  function renderUpdatedAt(updatedAt: number) {
    let text = document.querySelector('.updated-at') as HTMLElement
    text.innerText = getFormatUpdatedAt(updatedAt);
  }

  function getFormatUpdatedAt(updatedAt: number) {
    let date = new Date(updatedAt);

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
      + ` ${date.toLocaleTimeString()}`;
  }

  function addLiseners() {
    let radioButtons = document.querySelectorAll('input[type=radio]');
    Array.from(radioButtons).forEach((button: HTMLInputElement) => {
      button.addEventListener('focus', () => {
        if (button.name === 'rate') {
          if (button.id === 'gimp') {
            setRate('gimp');
            render();
            ga('send', 'event', 'Filter', 'SetIndicator', 'gimp');
          } else if (button.id === 'translate') {
            setRate('translate');
            render();
            ga('send', 'event', 'Filter', 'SetIndicator', 'translate');
          }
        } else if (button.name === 'time') {
          let time = button.id.slice(1, button.id.length);
          setTime(parseInt(time));
          fetchPriceData();
          ga('send', 'event', 'Filter', 'SetTime', time);
        }
        updateUrl();
      });
    });
  }


  function fetchPriceData() {
    axios.get(`https://15130i3vgl.execute-api.ap-northeast-2.amazonaws.com/dev/assets?t=${getTime()}`)
    // axios.get("price.json")
      .then((response: AxiosResponse) => {
        setPriceData(response.data.data);
        renderUpdatedAt(response.data.updated_at);
        render();
        resetRefreshTime();
        updateRefreshText();
        showLoading(false);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          console.error(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else {
          console.log(error.message);
        }
        resetRefreshTime();
      })
  }

  function parseUrl() {
    let rate = getParameterByName('rate');
    if (rate != null) {
      setRate(rate);       
    }
    let time = getParameterByName('time');
    if (time != null) {
      setTime(parseInt(time));
    }
  }

  function updateUrl() {
    if (window.history.replaceState) {
      let parser = document.createElement('a');
      parser.href = window.location.href;
      parser.search = `?rate=${getRate()}&time=${getTime()}`
      window.history.replaceState({}, null, parser.href);
    }
  }

  function getParameterByName(name: string) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function updateButtons() {
    let rateButton = document.querySelector(`input[type=radio][name=rate][id=${getRate()}]`) as HTMLInputElement;
    if (rateButton) {
      rateButton.click();
    }
    let timeButton = document.querySelector(`input[type=radio][name=time][id=t${getTime()}]`) as HTMLInputElement;
    if (timeButton) {
      timeButton.click();
    }
    let bookmark = document.querySelector('.bookmark')
    if (bookmark) {
      bookmark.addEventListener('click', () => {
        if (window.external && ('AddFavorite' in window.external)) {
          // Internet Explorer
          (window.external as any).AddFavorite(location.href, document.title); 
        }
      })
    }
  }

  function setRefreshTimer() {
    (document.querySelector('.time-refresh-button') as HTMLElement).addEventListener('click', () => {
        fetchPriceData();
        ga('send', 'event', 'Refresh', 'ClickButton', 'refresh');
    });
    window.setInterval(() => {
      decRefreshTime();
      updateRefreshText();
      if (getRefreshTime() == 0) {
        fetchPriceData();
        ga('send', 'event', 'Refresh', 'Timeout', 'refresh');
      }
    }, 1000);
  }

  function updateRefreshText() {
      let count = getRefreshTime();
      let refreshText = document.querySelector('.time-refresh-text') as HTMLElement;
      if (count > 5) {
        refreshText.innerText = `${count} 초`;
      } else {
        refreshText.innerText = '잠시';
      }    
  }

  function fetchCurrencyRate() {
    axios.get('https://api.manana.kr/exchange/rate/KRW/USD.json')
      .then((response: AxiosResponse) => {
        setCurrencyRate(response.data[0]['rate'])
        render();
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          console.error(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else {
          console.log(error.message);
        }
      })    
  }

  function showLoading(loading: boolean) {
    if (loaded || !loading) {
      loaded = true;
      $('#loading-modal').modal('hide');
    } else{
      window.setTimeout(() => {
        if (!loaded) {
          $('#loading-modal').modal('show');
        }
      }, 500);
    }
  }

  function showOnboarding() {
    let gimpButton = $('.gimp-onboarding')
    if (window.localStorage) {
      let localStorage = window.localStorage;
      if (!localStorage.getItem("onboarding:gimp_button")) {
        gimpButton.popover('show');
        document.querySelector('.gimp-onboarding').addEventListener('click', () => {
          gimpButton.popover('hide');
          gimpButton.popover('disable');
          localStorage.setItem('onboarding:gimp_button', 'done')
        });
      } else {
        gimpButton.popover('disable');
      }
    } else {
      gimpButton.popover('disable');
    }

  }

  showLoading(true);
  parseUrl();
  updateButtons();
  addLiseners();
  setRefreshTimer();
  fetchCurrencyRate();
  fetchPriceData();
  showOnboarding();
}

ready(main);

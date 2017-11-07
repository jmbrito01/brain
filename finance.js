const
    yahooFinance = require('yahoo-finance'),
    moment = require('moment'),
    Network = require('./network'),
    Tendency = require('./tendency'),
    Gync = require('gync');

class Finance {
    static historical({symbol, from, to, period}) {
        if (period === undefined) period = 'd';
        return new Promise((resolve, reject) => {
            if (Finance.isMoment(from)) from = Finance.formatMoment(from);
            if (Finance.isMoment(to)) to = Finance.formatMoment(to);

            yahooFinance.historical({ symbol, from, to, period }, (err, quotes) => {
                if (err) return reject(err);
                
                if (quotes.length > 0) resolve(quotes);
                else reject(new Error('No results were found.'));
            });
        })
    }

    static fetchData({symbol, from, to, period}) {
        return Gync.run(function* () {

            //Fetch historical prices
            let quotes = yield Finance.historical({ symbol, from, to });

            //Start to retrieve tendencies
            //SMA
            let sma = yield Tendency.getSMA({
                data: quotes,
                period,
                param: 'close'
            });

            //ADX
            let adx = yield Tendency.getADX({
                data: quotes,
                period
            });

            //RSI
            let rsi = yield Tendency.getRSI({
                data: quotes,
                param: 'close',
                period
            });

            //ATR
            let atr = yield Tendency.getATR({
                data: quotes,
                period
            });

            //Normalize data for the IA
            let price = Tendency.normalizeArray(quotes.map(each => { return each.close }).slice(period - 1));

            //Set the outputs
            let outputs = {
                good_buy: [],
                good_sell: [],
                neutral: []
            };

            for (let i = 0; i < price.length; i++) {
                if (i + 1 < price.length) {
                    outputs.good_sell.push(price[i] > price[i + 1] ? 1 : 0);
                    outputs.good_buy.push(price[i] < price[i + 1] ? 1 : 0);
                    outputs.neutral.push(price[i] === price[i + 1] ? 1 : 0);
                }
            }
            price.pop();

            let set = Network.formatData([sma, price, adx, rsi], [outputs.good_buy, outputs.neutral, outputs.good_sell], adx.length);

            return {
                set, price, rsi, sma, adx, outputs
            };
        })
    }

    static formatMoment(moment) {
        return moment.format('YYYY-MM-DD');
    }

    static isMoment(date) {
        return date.constructor instanceof moment.constructor;
    }
}

module.exports = Finance;
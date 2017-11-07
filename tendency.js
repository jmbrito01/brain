const
    talib           = require('talib');

class Tendency {
    static getSMA({data, period, param, startIdx, endIdx}) {
        if (startIdx === undefined) startIdx = 0;
        if (endIdx === undefined) endIdx = data.length - 2; //2 because you cant train with the last quote (because you dont know if its going to be good or bad to buy)
        if (param !== undefined) data = data.map(each => { return each[param] }); //TODO: Filter undefined values

        return new Promise((resolve, reject) => {
            talib.execute({
                name: 'SMA',
                startIdx,
                endIdx,
                optInTimePeriod: period,
                inReal: data
            }, sma => {
                resolve(Tendency.normalizeArray(sma.result.outReal));
            });
        });
    }

    static getATR({data, period, startIdx, endIdx, param}) {
        if (startIdx === undefined) startIdx = 0;
        if (endIdx === undefined) endIdx = data.length - 2; //2 because you cant train with the last quote (because you dont know if its going to be good or bad to buy)

        return new Promise((resolve, reject) => {
            talib.execute({
                name: 'ATR',
                startIdx,
                endIdx,
                optInTimePeriod: period,
                high: data.map(each => { return each.high }),
                low: data.map(each => { return each.low }),
                close: data.map(each => { return each.close })
            }, atr => {
                resolve(Tendency.normalizeArray(atr.result.outReal));
            })
        })
    }

    static getADX({data, period, startIdx, endIdx}) {
        if (startIdx === undefined) startIdx = 0;
        if (endIdx === undefined) endIdx = data.length - 2;

        return new Promise((resolve, reject) => {
            talib.execute({
                name: 'ADX',
                startIdx,
                endIdx,
                optInTimePeriod: period,
                high: data.map(each => { return each.high }),
                low: data.map(each => { return each.low }),
                close: data.map(each => { return each.close })
            }, adx => {
                resolve(Tendency.normalizeArray(adx.result.outReal));
            });
        })
    }

    static getRSI({data, period, startIdx, endIdx, param}) {
        if (startIdx === undefined) startIdx = 0;
        if (endIdx === undefined) endIdx = data.length - 2;
        if (param !== undefined) data = data.map(each => { return each[param] }); //TODO: Filter undefined values

        return new Promise((resolve, reject) => {
            talib.execute({
                name: 'RSI',
                startIdx,
                endIdx,
                optInTimePeriod: period,
                inReal: data
            }, rsi => {
                //Normalize RSI
                resolve(rsi.result.outReal.map((each) => { return each / 100; }));
            });
        })
    }

    static listFunctions() {
        let funcs = talib.functions;
        for (let func of funcs) {
            console.log(`Tendency function: ${func.name}`);
        }
    }

    static explain(name) {
        const util = require('util');
        console.log(util.inspect(talib.explain(name), {depth: 3}));
    }

    static normalizeArray(data, param) {
        let result = data;
        if (param !== undefined) result = result.map(each => { return each[param]; });

        let last = result.shift();
        return result.map((each, idx) => {
            let norm = each / last - .5;
            last = each;
            return norm;
        });
    }
}

module.exports = Tendency;
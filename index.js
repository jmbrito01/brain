const
    Finance             = require('./finance'),
    Network             = require('./network'),
    moment              = require('moment'),
    Gync                = require('gync');

let from = moment().subtract(2, 'years');
let to = moment().subtract(1, 'years');
let symbol = 'AAPL';
let period = 1;

Gync.run(function*() {
    console.log(`[1] Fetching and calculating data...`);
    let data = yield Finance.fetchData({symbol, from, to, period})
    console.log(`[1.1] Found ${data.set.length} entries`);
    console.log(`[2] Training neural network.`);

    let network = new Network();
    let result = Network.train({
        set: data.set,
        network
    });

    console.log(`[2.1] Error after ${result.iterations} iterations: ${result.error} (Calculated in ${result.time}ms)`);

    console.log(`[3] Starting to test neural network.`);
    from = to;
    to = moment();
    data = yield Finance.fetchData({symbol, from, to, period})
    let stats = Network.test({set: data.set, price: data.price, network});

    console.log(`[3.1] Accuracy: ${(stats.right / (stats.wrong + stats.right))*100}%`);
}).then(() => {
    //No errors
    console.log(`[DONE]`);
}, error => {
    //Error!
    console.error(`[ERROR] Error occurred!`);
    throw error.stack;
})

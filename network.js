const
    synaptic = require('synaptic');

class Network extends synaptic.Network {
    constructor() {
        super();

        let
            input = new synaptic.Layer(4),
            hidden = new synaptic.Layer(8),
            output = new synaptic.Layer(3);

        input.project(hidden);
        hidden.project(output);

        this.set({ input, hidden: [hidden], output });
    }

    static formatData(inputs, outputs, size) {
        let result = [];
        for (let i = 0; i < size; i++) {
            let each = {
                input: [],
                output: []
            };

            for (let each_input of inputs) {
                each.input.push(each_input[i]);
            }
            for (let each_output of outputs) {
                each.output.push(each_output[i]);
            }

            result.push(each);
        }

        return result;
    }

    static train({set, rate, iterations, network}) {
        if (rate === undefined) rate = .05;
        if (iterations === undefined) iterations = 30000;

        if (process.env.NODE_ENV === 'development') {
            var log = 1;
        }

        let trainer = new synaptic.Trainer(network);

        return trainer.train(set, {
            rate, iterations,
            shuffle: false,
            log
        });
    }

    static test({set, network, price}) {
        
        let stats = {
            right: 0,
            wrong: 0
        };
        set.forEach((each, idx) => {
            let networkResult = network.activate(each.input);
            let resultId = networkResult.indexOf(Math.max.apply(null, networkResult));
            switch (resultId) {
                case 0:
                    if (idx + 1 < price.length && price[idx] < price[idx + 1]) stats.right++; //good to buy
                    else stats.wrong++;
                    break;
                case 1:
                    if (idx + 1 < price.length && price[idx] === price[idx + 1]) stats.right++; //neutral
                    else stats.wrong++;
                    break;
                case 2:
                    if (idx + 1 < price.length && price[idx] > price[idx + 1]) stats.right++; //good to sell
                    else stats.wrong++;
                    break;
            }
        });

        return stats;
    }
}

module.exports = Network;
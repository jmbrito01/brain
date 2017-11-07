import * as synaptic from 'synaptic';

export class Network extends synaptic.Network {
  private readonly LayerCount = {
    input: 4,
    hidden: 8,
    output: 3
  }

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

  static formatData(inputs: number[], outputs: number[], size: number) {
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
}
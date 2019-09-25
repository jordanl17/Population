import processArguments from '../src/argumentsHelper';

describe('argumentsHelper', () => {
  it('should correctly process a single empty param key', () => {
    const inputProcessArguments = ['--key'];
    const expectResult = { key: [] };
    const result = processArguments(inputProcessArguments);

    expect(result).toEqual(expectResult);
  });

  it('should correctly process multiple empty param key', () => {
    const inputProcessArguments = ['--keyOne', '--keyTwo'];
    const expectResult = { keyOne: [], keyTwo: [] };
    const result = processArguments(inputProcessArguments);

    expect(result).toEqual(expectResult);
  });

  it('should correctly process a single param key with multiple values', () => {
    // 'value-three' to test hyphen to space replacement
    const inputProcessArguments = ['--key', 'value one', 'valueTwo', 'value-three'];
    const expectResult = { key: ['value one', 'valueTwo', 'value three'] };
    const result = processArguments(inputProcessArguments);

    expect(result).toEqual(expectResult);
  });

  it('should correctly process multiple param keys with multiple values', () => {
    const inputProcessArguments = ['--keyOne', 'value one', '--keyTwo', 'valueOne', 'value two'];
    const expectResult = { keyOne: ['value one'], keyTwo: ['valueOne', 'value two'] };
    const result = processArguments(inputProcessArguments);

    expect(result).toEqual(expectResult);
  });

  it('should not process an invalid param key identifier', () => {
    const inputProcessArguments = ['-invalidKey', 'value one', '--keyTwo', 'valueOne', 'value two'];
    const expectResult = { keyTwo: ['valueOne', 'value two'] };
    const result = processArguments(inputProcessArguments);

    expect(result).toEqual(expectResult);
  });
});

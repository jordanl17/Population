import sorter from '../src/sorter';
import populationService from '../src/services/populationService';

global.console = { error: jest.fn(), table: jest.fn(), warn: jest.fn() };
jest.mock('../src/services/populationService');

describe('sorter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should error if no input contries provided', () => {
    const expectedErrorMessage =
      "You should enter at least 2 distinct countries to compare in the format '--countries <country_one> <country_two>'";

    process.argv = ['--no-countries'];
    sorter.start();

    expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('should error if fewer than 2 countries are provided', () => {
    const expectedErrorMessage =
      "You should enter at least 2 distinct countries to compare in the format '--countries <country_one> <country_two>'";

    process.argv = ['--countries', 'Country one'];
    sorter.start();

    expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('should make calls to population service for each input country', () => {
    process.argv = ['--countries', 'Country one', 'Country two'];
    sorter.start();

    const getPopulationToDateCalls = populationService.getPopulationToDate.mock.calls;

    expect(populationService.getPopulationToDate).toHaveBeenCalledTimes(2);
    expect(getPopulationToDateCalls[0][0]).toEqual('Country one');
    expect(getPopulationToDateCalls[1][0]).toEqual('Country two');
  });

  it('should make only one call to population service for each duplicated input country', () => {
    process.argv = ['--countries', 'Country duplicate', 'Country two', 'Country duplicate'];
    sorter.start();

    const getPopulationToDateCalls = populationService.getPopulationToDate.mock.calls;

    expect(populationService.getPopulationToDate).toHaveBeenCalledTimes(2);
    expect(getPopulationToDateCalls[0][0]).toEqual('Country duplicate');
    expect(getPopulationToDateCalls[1][0]).toEqual('Country two');
  });

  it('should capitalise the first char of each country before processing', () => {
    process.argv = ['--countries', 'country one', 'country two'];
    sorter.start();

    const getPopulationToDateCalls = populationService.getPopulationToDate.mock.calls;

    expect(getPopulationToDateCalls[0][0]).toEqual('Country one');
    expect(getPopulationToDateCalls[1][0]).toEqual('Country two');
  });

  it('should correctly display successfully retrieved population data in descending order', async () => {
    process.argv = ['--countries', 'country one', 'country two', 'country three'];
    const countryBig = { country: 'country big', population: 200 };
    const countrySmall = { country: 'country small', population: 1 };
    const countryMedium = { country: 'country medium', population: 100 };

    // resolve the requests in an unordered order to ensure sorting is tested
    populationService.getPopulationToDate
      .mockReturnValueOnce(Promise.resolve(countryBig))
      .mockReturnValueOnce(Promise.resolve(countrySmall))
      .mockReturnValueOnce(Promise.resolve(countryMedium));

    await sorter.start(); // wait for processing to complete

    expect(console.table).toHaveBeenCalledWith(
      [countryBig, countryMedium, countrySmall],
      ['country', 'population']
    );

    expect(console.warn).not.toHaveBeenCalled(); // no invalid countries
  });

  it('should correctly display failed retrieved population data as warning', async () => {
    process.argv = ['--countries', 'country one', 'country two'];
    const countryFailureOne = { country: 'country invalid one', invalidCountry: true };
    const countryFailureTwo = { country: 'country invalid two', invalidCountry: true };

    populationService.getPopulationToDate
      .mockReturnValueOnce(Promise.resolve(countryFailureOne))
      .mockReturnValueOnce(Promise.resolve(countryFailureTwo));

    await sorter.start(); // wait for processing to complete

    expect(console.table).not.toHaveBeenCalled();

    expect(console.warn).toHaveBeenCalledWith(
      'The following countries were not valid: country invalid one, country invalid two'
    );
  });

  it('should show error message for failed API requests', async () => {
    process.argv = ['--countries', 'country one', 'country two'];

    populationService.getPopulationToDate.mockReturnValueOnce(
      Promise.reject(new Error('api test error'))
    );

    try {
      await sorter.start(); // wait for processing to complete
    } catch {
      // rejection scope
      expect(console.table).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();

      expect(console.error).toHaveBeenCalledWith(
        'Some API requests were not successful, error=api test error'
      );
    }
  });

  it('should correctly display successfully retrieved population data and show warning when one country exists and another does not', async () => {
    process.argv = ['--countries', 'country one', 'country two'];
    const countryInvalid = { country: 'country invalid', invalidCountry: true };
    const countryValid = { country: 'country valid', population: 1 };

    /**
     * mock invalid call first to ensure that invalid countries
     * allow for continued processing
     */
    populationService.getPopulationToDate
      .mockReturnValueOnce(Promise.resolve(countryInvalid))
      .mockReturnValueOnce(Promise.resolve(countryValid));

    await sorter.start(); // wait for processing to complete

    // only show table for successful countries
    expect(console.table).toHaveBeenCalledWith([countryValid], ['country', 'population']);
    expect(console.warn).toHaveBeenCalledWith(
      'The following countries were not valid: country invalid'
    );
  });
});

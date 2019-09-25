import axios from 'axios';
import populationService from '../../src/services/populationService';

jest.mock('axios', () => ({
  get: jest.fn()
}));

global.Date = jest.fn(() => ({ toISOString: jest.fn(() => '2019-06-07T') }));

describe('populationService', () => {
  it('should make query to correct URL with correct time and country', () => {
    const expectedAxiosGetRequest = 'http://54.72.28.201/1.0/population/test-country/2019-06-07';

    axios.get.mockReturnValueOnce(
      Promise.resolve({ data: { total_population: { population: 1 } } })
    );

    populationService.getPopulationToDate('test-country');
    expect(axios.get).toHaveBeenCalledWith(expectedAxiosGetRequest);
  });

  it('should return country and population on successful api response', async () => {
    const expectedResult = { country: 'test-country', population: 1 };

    axios.get.mockReturnValueOnce(
      Promise.resolve({ data: { total_population: { population: 1 } } })
    );

    const serviceResult = await populationService.getPopulationToDate('test-country');

    expect(serviceResult).toEqual(expectedResult);
  });

  it('should return country and invalidCountry flag on api failure due to invalid country response', async () => {
    const expectedResult = { country: 'test-country', invalidCountry: true };

    const mockRejectionResponse = {
      response: {
        data: {
          detail: 'some error about response is an invalid value for the parameter "country"'
        }
      }
    };
    axios.get.mockReturnValueOnce(Promise.reject(mockRejectionResponse));

    const serviceResult = await populationService.getPopulationToDate('test-country');

    expect(serviceResult).toEqual(expectedResult);
  });

  it('should return error on api failure due NOT to invalid country response', async () => {
    const mockError = 'some error about response not due to invalid country';

    const mockRejectionResponse = {
      response: {
        data: {
          detail: mockError
        }
      }
    };
    axios.get.mockReturnValueOnce(Promise.reject(mockRejectionResponse));

    try {
      await populationService.getPopulationToDate('test-country');
    } catch (err) {
      // error scope
      expect(err.message).toEqual(mockError);
    }
  });

  it('should return "unknown error" on api failure without standard response', async () => {
    const mockError = 'unknown error';

    const mockRejectionResponse = {
      response: 'unexpected structure'
    };
    axios.get.mockReturnValueOnce(Promise.reject(mockRejectionResponse));

    try {
      await populationService.getPopulationToDate('test-country');
    } catch (err) {
      // error scope
      expect(err.message).toEqual(mockError);
    }
  });
});

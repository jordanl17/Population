import axios from 'axios';

const API_URL = 'http://54.72.28.201/1.0/';

const getPopulationToDate = country => {
  const formattedQueryDate = new Date().toISOString().split('T')[0];
  const formattedFullQuery = `population/${country}/${formattedQueryDate}`;

  return axios
    .get(API_URL + formattedFullQuery)
    .then(({ data: { total_population: { population } } }) => ({ country, population }))
    .catch(
      ({
        response: { data: { detail = 'unknown error' } = { detail: 'unknown error' } } = {
          data: { detail: 'unknown error' }
        }
      }) => {
        if (detail.includes('is an invalid value for the parameter "country"')) {
          return Promise.resolve({ country, invalidCountry: true });
        }
        return Promise.reject(new Error(detail));
      }
    );
};

export default { getPopulationToDate };

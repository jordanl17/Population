import populationService from './services/populationService';
import processArgs from './argumentsHelper';

const start = async () => {
  // data clensing
  const processedArgs = processArgs(process.argv);

  // if countries exists then capitalise first char, and remove duplicates
  const inputCountries = processedArgs.countries && [
    ...new Set(
      processedArgs.countries.map(country => country.charAt(0).toUpperCase() + country.slice(1))
    )
  ];

  if (!inputCountries || inputCountries.length <= 1) {
    console.error(
      "You should enter at least 2 distinct countries to compare in the format '--countries <country_one> <country_two>'"
    );
    return;
  }

  // data processing
  await Promise.all(inputCountries.map(populationService.getPopulationToDate))
    .then(populationForCountriesResults => {
      const successfulSortedCountries = populationForCountriesResults
        .filter(({ invalidCountry }) => !invalidCountry)
        .sort(
          ({ population: populationA }, { population: populationB }) => populationB - populationA
        );
      const invalidCountries = populationForCountriesResults.filter(
        ({ invalidCountry }) => invalidCountry
      );

      if (successfulSortedCountries.length > 0)
        console.table(successfulSortedCountries, ['country', 'population']);

      if (invalidCountries.length > 0)
        console.warn(
          `The following countries were not valid: ${invalidCountries
            .map(({ country }) => country)
            .join(', ')}`
        );
    })
    .catch(err => console.error(`Some API requests were not successful, error=${err}`));
};

export default { start };

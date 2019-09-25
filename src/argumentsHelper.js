const processArgs = processArguments =>
  processArguments.reduce((paramKeys, currentarg) => {
    const paramRegExp = new RegExp(/^--/g);
    if (paramRegExp.test(currentarg)) {
      // slice from 2nd index due to '--' param identifer
      return { ...paramKeys, [currentarg.slice(2)]: [] };
    }
    const numberOfAggArgs = Object.keys(paramKeys).length;

    return Object.entries(paramKeys).reduce((paramVals, [key, val], index) => {
      if (index !== numberOfAggArgs - 1) {
        // not the last param key so set param object to the existing paramKey, paramVal pairs
        return { ...paramVals, [key]: val };
      }
      // replace '-' with a space char
      return {
        ...paramVals,
        [key]: [...val, currentarg.replace('-', ' ')]
      };
    }, {});
  }, {});

export default processArgs;

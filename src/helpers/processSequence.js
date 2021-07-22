/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
import * as R from "ramda";

import Api from "../tools/api";

const api = new Api();

// prettier-ignore
//
// compose, умеющий в асинхронные функции
//
// если одна из асинхронных функций рухнула, то следующие функции не выполняются
// хотя итерация по ним все равно проходит
const syncAsyncCompose = (...funcs) => (input) => {
    let isSomePromiseCollapsed = false;

    return funcs.reduceRight(
      (promise, f) =>
        promise
          .then((v) => (isSomePromiseCollapsed ? Promise.resolve() : f(v)))
          .catch((e) => {
            console.log(`Промис рухнул со словами: "${e}"`);
            isSomePromiseCollapsed = true;
            return Promise.resolve();
          }),
      Promise.resolve(input)
    );
  };

const poisonCompose = (text) => Promise.reject(text);

// /**
//  * Я – пример, удали меня
//  */

// const wait = (time) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });

const processSequence = ({ value, writeLog, handleSuccess, handleError }) => {
  // prettier-ignore
  const log = (preface="") => R.tap((logText) => writeLog(`${preface}${logText}`));

  const handleErrorAndPoisonCompose = (errorHandler) => () => {
    errorHandler();
    return poisonCompose("Предыдущая функция вернула ложное значение");
  };

  const lengthLessThan = (v) => R.compose(R.lt(R.__, v), R.length);
  const lengthMoreThan = (v) => R.compose(R.gt(R.__, v), R.length);

  const isNumberPositive = R.compose(R.gte(R.__, 0), Number);
  const handleValidationError = () => handleError("ValidationError");
  const handleApiRejectionError = () => handleError("ApiRejectionError");

  const roundNumber = R.compose(Math.round, Number);

  const transformNumberBase = R.partial(api.get, ["https://api.tech/numbers/base"]);
  const transformFrom10to2Base = (n) =>
    transformNumberBase({ from: 10, to: 2, number: n }).then(({ result }) => result);

  const getAnimalById = (id) => api.get(`https://animals.tech/${id}/`);

  const testWithRegExp = (regExp) => (v) => regExp.test(v);
  const decimalRegExp = /^[+-]?[0-9]+(.[0-9]+)?$/;
  const isNumberDecimal = testWithRegExp(decimalRegExp);

  const square = (n) => R.multiply(n, n);

  //   /**
  //    * Я – пример, удали меня
  //    */
  //  writeLog(value);

  //  api.get('https://api.tech/numbers/base', {from: 2, to: 10, number: '01011010101'}).then(({result}) => {
  //      writeLog(result);
  //  });

  //  wait(2500).then(() => {
  //      writeLog('SecondLog')

  //      return wait(1500);
  //  }).then(() => {
  //      writeLog('ThirdLog');

  //      return wait(400);
  //  }).then(() => {
  //      handleSuccess('Done');
  //  });

  const logValue = log("Число: ");

  const validateN = R.allPass([lengthLessThan(10), lengthMoreThan(2), isNumberDecimal, isNumberPositive]);

  const roundValueANDLOG = R.compose(log("Число округлено: "), roundNumber);
  const transformFrom10to2BaseANDLOG = syncAsyncCompose(
    log("Число трансформировано в двоичную: "),
    transformFrom10to2Base
  );

  const getAnimalByIdANDLOG = syncAsyncCompose(
    log("Полученная живность: "),
    getAnimalById
  );
  const getLengthANDLOG = R.compose(log("Взята длина: "), R.length);
  const squareANDLOG = R.compose(log("Возведено в квадрат: "), square);
  const getRemainderOf3ANDLOG = R.compose(log("Взят остаток от деления на 3: "), R.modulo(R.__, 3));

  syncAsyncCompose(
    handleSuccess,

    R.unless(R.identity, handleErrorAndPoisonCompose(handleApiRejectionError)),
    getAnimalByIdANDLOG,

    getRemainderOf3ANDLOG,
    squareANDLOG,
    getLengthANDLOG,

    R.unless(R.identity, handleErrorAndPoisonCompose(handleApiRejectionError)),
    transformFrom10to2BaseANDLOG,

    roundValueANDLOG,

    R.unless(validateN, handleErrorAndPoisonCompose(handleValidationError)),
    logValue
  )(value);
};

export default processSequence;

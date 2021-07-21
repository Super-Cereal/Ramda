/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */

import * as R from "ramda";

const unequals = R.complement(R.equals);

const isColoredWith = (object, color) => R.equals(object, color);
const isNotColoredWith = (object, color) => unequals(object, color);

const isWhite = R.partialRight(isColoredWith, ["white"]);
const isGreen = R.partialRight(isColoredWith, ["green"]);
const isOrange = R.partialRight(isColoredWith, ["orange"]);
const isRed = R.partialRight(isColoredWith, ["red"]);
const isBlue = R.partialRight(isColoredWith, ["blue"]);

const isNotWhite = R.partialRight(isNotColoredWith, ["white"]);
// const isNotGreen = R.partialRight(isNotColoredWith, ["green"]);
// const isNotOrange = R.partialRight(isNotColoredWith, ["orange"]);
const isNotRed = R.partialRight(isNotColoredWith, ["red"]);
// const isNotBlue = R.partialRight(isNotColoredWith, ["blue"]);

const getTriangle = R.prop("triangle");
const getCircle = R.prop("circle");
const getSquare = R.prop("square");
const getStar = R.prop("star");

const countColored = (color, { star, square, triangle, circle }) => {
  const countSuitableShapes = R.compose(R.length, R.filter(R.equals(color)));

  return { color, value: countSuitableShapes([star, square, triangle, circle]) };
};

const countGreen = R.partial(countColored, ["green"]);
const countWhite = R.partial(countColored, ["white"]);
const countOrange = R.partial(countColored, ["orange"]);
const countRed = R.partial(countColored, ["red"]);
const countBlue = R.partial(countColored, ["blue"]);

const passArgToFunction = (value) => (func) => func(value);

const getValueOfColorObject = (colorObject) => colorObject.value;
const getColorOfColorObject = (colorObject) => colorObject.color;

const valueGreaterThan = R.flip(R.gt);

// 1. Красная звезда, зеленый квадрат, все остальные белые.
export const validateFieldN1 = (shapes) => {
  const isTriangleWhite = R.compose(isWhite, getTriangle);
  const isCircleWhite = R.compose(isWhite, getCircle);
  const isStarRed = R.compose(isRed, getStar);
  const isSquareGreen = R.compose(isGreen, getSquare);

  return R.allPass([isTriangleWhite, isCircleWhite, isStarRed, isSquareGreen])(shapes);
};

// 2. Как минимум две фигуры зеленые.
export const validateFieldN2 = (shapes) => R.compose(valueGreaterThan(1), getValueOfColorObject, countGreen)(shapes);

// 3. Количество красных фигур равно кол-ву синих.
export const validateFieldN3 = (shapes) => {
  const getCountValueOfRedColor = R.compose(getValueOfColorObject, countRed);
  const getCountValueOfBlueColor = R.compose(getValueOfColorObject, countBlue);

  return R.equals(getCountValueOfRedColor(shapes), getCountValueOfBlueColor(shapes));
};

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
export const validateFieldN4 = (shapes) => {
  const isCircleBlue = R.compose(isBlue, getCircle);
  const isStarRed = R.compose(isRed, getStar);
  const isSquareOrange = R.compose(isOrange, getSquare);

  return R.allPass([isCircleBlue, isStarRed, isSquareOrange])(shapes);
};

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
export const validateFieldN5 = (shapes) => {
  const colorCounters = [countGreen, countWhite, countBlue, countOrange, countRed];

  const passShapesToFunction = passArgToFunction(shapes);
  const countAllColors = R.map(passShapesToFunction);

  const isColorObjectValueGreaterThan2 = R.compose(valueGreaterThan(2), getValueOfColorObject);
  const findColorAppeared3Times = R.find(isColorObjectValueGreaterThan2);

  const checkIfColorExistsAndItsNotWhite = R.ifElse(
    R.anyPass([R.isNil, R.compose(isWhite, getColorOfColorObject)]),
    R.F,
    R.T
  );

  return R.compose(checkIfColorExistsAndItsNotWhite, findColorAppeared3Times, countAllColors)(colorCounters);
};

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
export const validateFieldN6 = (shapes) => {
  const isTriangleGreen = R.compose(isGreen, getTriangle);

  const exactlyTwoGreenShapes = R.compose(R.equals(2), getValueOfColorObject, countGreen);
  const exactlyOnyRedShape = R.compose(R.equals(1), getValueOfColorObject, countRed);

  return R.allPass([isTriangleGreen, exactlyTwoGreenShapes, exactlyOnyRedShape])(shapes);
};

// 7. Все фигуры оранжевые.
export const validateFieldN7 = (shapes) => R.compose(R.equals(4), getValueOfColorObject, countOrange)(shapes);

// 8. Не красная и не белая звезда, остальные – любого цвета.
export const validateFieldN8 = (shapes) => {
  const isNotStarRed = R.compose(isNotRed, getStar);
  const isNotStarWhite = R.compose(isNotWhite, getStar);

  return R.allPass([isNotStarRed, isNotStarWhite])(shapes);
};

// 9. Все фигуры зеленые.
export const validateFieldN9 = (shapes) => R.compose(R.equals(4), getValueOfColorObject, countGreen)(shapes);

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
export const validateFieldN10 = (shapes) => {
  const isNotSquareWhite = R.compose(isNotWhite, getSquare);

  const haveSquareAndTriangleSameColor = (shapes) => R.equals(getSquare(shapes), getTriangle(shapes));

  return R.allPass([isNotSquareWhite, haveSquareAndTriangleSameColor])(shapes);
};

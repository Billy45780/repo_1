// Задание 1: ФУНКЦИЯ-СЧЁТЧИК
function createCounter() {
  let count = 0; // приватная переменная

  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getValue: function() {
      return count;
    }
  };
}

// пример использования
const counter = createCounter();
console.log("Задание 1: Счётчик");
console.log(counter.getValue());   // 0
console.log(counter.increment());  // 1
console.log(counter.increment());  // 2
console.log(counter.decrement());  // 1
console.log("-------------------");



// Задание 2: ФУНКЦИЯ-МЕМоИЗАТОР
function memoize(fn) {
  let cache = {};

  return function(n) {
    if (cache[n] !== undefined) {
      return cache[n]; // вернуть из памяти
    }
    let result = fn(n);
    cache[n] = result; // сохранить в кэш
    return result;
  };
}

// пример функции
function expensiveCalculation(n) {
  console.log("Вычисляем для:", n);
  return n * 2;
}

const memoizedCalculation = memoize(expensiveCalculation);

console.log("Задание 2: Мемоизатор");
console.log(memoizedCalculation(5));  // "Вычисляем для: 5", 10
console.log(memoizedCalculation(5));  // 10 (из кэша)
console.log(memoizedCalculation(10)); // "Вычисляем для: 10", 20
console.log(memoizedCalculation(10)); // 20 (из кэша)
console.log("-------------------");



// Задание 3: ФУНКЦИЯ-КАРРИРОВЩИК
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...next) {
        return curried.apply(this, args.concat(next));
      };
    }
  };
}

// пример функции
function multiplyThreeNumbers(a, b, c) {
  return a * b * c;
}

const curriedMultiply = curry(multiplyThreeNumbers);

console.log("Задание 3: Каррирование");
console.log(curriedMultiply(2)(3)(4));     // 24
console.log(curriedMultiply(2, 3)(4));     // 24
console.log(curriedMultiply(2)(3, 4));     // 24
console.log(curriedMultiply(2, 3, 4));     // 24
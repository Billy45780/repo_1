
//Задание 1: AdvancedPromise


//Немного поэкспериментировала с этим классом, вроде всё ок
class AdvancedPromise {
  //Повторяет выполнение функции, если она падает
  static async retry(promiseFn, maxAttempts = 3, delay = 1000) {
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        return await promiseFn();
      } catch (err) {
        console.log("Попытка:", i, "ошибка:", err.message);
        if (i === maxAttempts) throw err;
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i - 1)));
      }
    }
  }

  //Завершает промис ошибкой по таймауту
  static timeout(promise, ms) {
    let timeoutId;
    const timer = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("timeout")), ms);
    });
    return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timer]);
  }

  //Простая очередь с ограничением параллельности
  static async queue(tasks, concurrency = 1) {
    const results = [];
    let idx = 0;

    async function worker() {
      while (idx < tasks.length) {
        const current = idx++;
        try {
          const res = await tasks[current]();
          results[current] = res;
        } catch (e) {
          results[current] = e;
        }
      }
    }

    const workers = [];
    for (let i = 0; i < concurrency; i++) workers.push(worker());
    await Promise.all(workers);
    return results;
  }
}

//проверяла, всё вроде работает
(async () => {
  console.log("Задание 1: AdvancedPromise");

  let count = 0;
  const data = await AdvancedPromise.retry(async () => {
    count++;
    if (count < 2) throw new Error("ошибка запроса");
    return "ok после " + count + " попыток";
  });
  console.log("retry:", data);

  try {
    await AdvancedPromise.timeout(
      new Promise(r => setTimeout(() => r("успел"), 500)),
      1000
    ).then(console.log);
  } catch (e) {
    console.log("timeout:", e.message);
  }

  const tasks = [
    () => new Promise(r => setTimeout(() => r("A"), 400)),
    () => new Promise(r => setTimeout(() => r("B"), 200)),
    () => new Promise(r => setTimeout(() => r("C"), 300))
  ];

  const res = await AdvancedPromise.queue(tasks, 2);
  console.log("queue:", res);
  console.log("------------------");
})();



//Задание 2: processDataAsync


async function processDataAsync(data, fn, opts = {}) {
  const { concurrency = 1, retryAttempts = 1 } = opts;
  const results = [];
  const stats = { ok: 0, fail: 0 };
  let paused = false;
  let index = 0;

  const pause = () => new Promise(r => {
    const id = setInterval(() => {
      if (!paused) {
        clearInterval(id);
        r();
      }
    }, 50);
  });

  async function worker() {
    while (index < data.length) {
      if (paused) await pause();
      const i = index++;
      let tries = 0;
      while (tries < retryAttempts) {
        try {
          const res = await fn(data[i]);
          results[i] = res;
          stats.ok++;
          break;
        } catch (err) {
          tries++;
          if (tries >= retryAttempts) {
            stats.fail++;
            results[i] = err;
          }
        }
      }
    }
  }

  const ws = [];
  for (let i = 0; i < concurrency; i++) ws.push(worker());
  await Promise.all(ws);
  return { results, stats, pause: () => (paused = true), resume: () => (paused = false) };
}

//пробовала с простыми данными
(async () => {
  console.log("Задание 2: processDataAsync");

  const nums = [1, 2, 3, 4];
  const handler = async n => {
    await new Promise(r => setTimeout(r, 100));
    if (n === 3) throw new Error("ошибка для " + n);
    return n * 10;
  };

  const result = await processDataAsync(nums, handler, { concurrency: 2, retryAttempts: 2 });
  console.log("Результаты:", result.results);
  console.log("Статистика:", result.stats);
  console.log("------------------");
})();



//Задание 3: AsyncPipeline


class AsyncPipeline {
  constructor() {
    this.steps = [];
  }

  addStep(fn) {
    this.steps.push(fn);
    return this;
  }

  async execute(input) {
    let val = input;
    for (const step of this.steps) {
      //на всякий случай, чтобы видеть промежуточный результат
      //console.log("step:", val);
      val = await step(val);
    }
    return val;
  }

  static async parallel(pipes) {
    return Promise.all(pipes.map(p => p.execute()));
  }
}

//проверка работы
(async () => {
  console.log("Задание 3: AsyncPipeline");

  const pipe = new AsyncPipeline()
    .addStep(async arr => arr.filter(x => x > 0))
    .addStep(async arr => arr.map(x => x * 2))
    .addStep(async arr => arr.reduce((a, b) => a + b, 0));

  const total = await pipe.execute([-1, 2, -3, 4, 5]);
  console.log("Итог:", total);
})();

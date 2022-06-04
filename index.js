const { VK, createCollectIterator } = require('vk-io');
const { printLogo, chunkArray, sleep } = require('./utils');
const { token } = require('./config.json');

if(typeof token != 'string' || !token.length){
  printLogo(`             \x1b[4m\x1b[31m Токен доступа не указан! config.json -> token)\n\x1b[0m`);
  sleep(1000).then(() => process.exit(0));
}

const vk = new VK({ token });

(async () => {
  const start = Date.now();
  const iterator = createCollectIterator({
    api: vk.api,
    method: 'messages.getConversations',
    params: {},
    countPerRequest: 200,
    parallelRequests: 25
  });

  const raw_request = [];

  for await (const item of iterator) {
    const { items, percent } = item;
    printLogo(`Получение диалогов: ${percent} %`);
    for (let i = 0; i < items.length; i++) {
      const { conversation: dialog } = items[i];
      raw_request.push(`API.messages.markAsUnreadConversation({ "peer_id": ${dialog.peer.id} })`);
    }
  }

  const chunked_raw_requests = chunkArray(raw_request, 25);

  const result_promises = [];

  let count = 1;

  for (let i = 0; i < chunked_raw_requests.length; i++) {
    let code = `var data = [];`;
    const chunk = chunked_raw_requests[i];
    for (let j = 0; j < chunk.length; j++) {
      code += `data.push(${chunk[j]});`;
      printLogo(`Отправка запросов: ${Math.round(100 / (raw_request.length / count))}%`);
      count++;
    }
    code += `return data;`;
    result_promises.push(vk.api.execute({ code }).then(data => {
      const success = data.response.filter(x => !!x).length;
      const total = data.response.length;
      return {
        success,
        total,
        errored: total - success
      }
    }));
  }

  const results = await Promise.allSettled(result_promises);
  const data = results.reduce((acc, result) => {

    if (result.status == 'rejected') { return acc; }

    return {
      success: acc.success + result.value.success,
      total: acc.total + result.value.total,
      errored: acc.errored + result.value.errored
    }
  }, { success: 0, total: 0, errored: 0 });

  printLogo(`Всего: ${data.total} | Успешно: ${data.success} | Ошибок: ${data.errored}\n`);
  printLogo(`Скрипт завершил работу за ${Date.now() - start} мс.!\n`);
  await sleep(1000);
  process.exit(0);
})();


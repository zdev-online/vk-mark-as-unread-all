module.exports.sleep = (timeout = 0) => new Promise(ok => setTimeout(ok, timeout));

module.exports.write = (string = "") => process.stdout.write(`${string}\n`, 'utf-8');

module.exports.getHorizontalCenterSpacing = (string = "", separator = " ") => {
  const length = Math.floor(process.stdout.columns / 2 - string.length / 2);
  return Array(length).fill(separator).join('');
}

module.exports.getVerticalCenterSpacing = () => {
  const length = Math.floor(process.stdout.rows / 2 / 2);
  return Array(length).fill('\n').join('');
}

const line_separator = "";

let anim = "/╲/\\( •̀ ω •́ )/\\╱\\------------------------------".split(line_separator);

const logo = () => [
  ` ____ ___                    ___         _  _            `,
  `|_  /|   \\  ___ __ __       / _ \\  _ _  | |(_) _ _   ___ `,
  ` / / | |) |/ -_)\\ V /      | (_) || ' \\ | || || ' \\ / -_)`,
  `/___||___/ \\___| \\_/        \\___/ |_||_||_||_||_||_|\\___|`
].map(x => {
  const spacing = this.getHorizontalCenterSpacing(x, " ");
  return `${spacing}${x}`;
}).join('\n');


let interval;

module.exports.printLogo = (info = "") => {
  interval && clearInterval(interval);
  console.clear();
  interval = setInterval(() => {
    console.clear();
    this.write(this.getVerticalCenterSpacing());
    const anim_spacing = this.getHorizontalCenterSpacing(anim.join(line_separator), " ");
    anim = anim.splice(-1).concat(anim);;
    this.write(`\x1b[32m${anim_spacing} ${anim.join(line_separator)}\x1b[0m`);
    this.write(logo());
    if (info.length) {
      this.write();
      const info_spacing = this.getHorizontalCenterSpacing(`${info}`, " ");
      this.write(`${info_spacing} ${info}`);
    }
    const exit_text = 'Чтобы выйти - нажмите Ctrl + C в консоли.';
    const tg_text = 'Канал Telegram: https://t.me/zdev_online';
    const tg_text_center = this.getHorizontalCenterSpacing(tg_text, " ");
    const exit_text_center = this.getHorizontalCenterSpacing(exit_text, " ");
    this.write(`\x1b[36m${tg_text_center}${tg_text}\x1b[0m`);
    this.write(`${exit_text_center}${exit_text}`);
    this.write();
    this.write(`\x1b[32m${anim_spacing} ${anim.join(line_separator)}\x1b[0m`);
    process.stdout.cursorTo(0, 0);
  }, 100);

}

module.exports.chunkArray = (arr, size) => arr.reduce((chunks, el, i) => (i % size
  ? chunks[chunks.length - 1].push(el)
  : chunks.push([el])) && chunks, []);

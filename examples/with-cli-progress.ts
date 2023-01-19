import { CliProgressRunContext, cliProgressTaskPoolExecutor } from '../src';

const taskPool = cliProgressTaskPoolExecutor<string>();

const delayedTask = (millis: number, title: string) => {
    const run = (ctx?: CliProgressRunContext) =>
        new Promise<string>((resolve) => {
            const interval = setInterval(() => {
                ctx?.progress.increment();
            }, 8);
            const timeout = setTimeout(() => {
                clearInterval(interval);
                resolve('done');
            }, millis);
        });
    return { title, run };
};

const tasks = new Array(10)
    .fill(0)
    .map((_v, index) => delayedTask(2000, `task ${index}`));

const internal = async () => {
    tasks.forEach((t) => taskPool.submit(t));
    await delayedTask(8000, 'running').run();
    await taskPool.close();
};

internal().then(console.info).catch(console.error);

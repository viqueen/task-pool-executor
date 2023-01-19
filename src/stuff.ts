import { cliProgressTaskPoolExecutor } from './index';

const taskPool = cliProgressTaskPoolExecutor<string>();

const delayedTask = (millis: number, title: string) => {
    const run = () =>
        new Promise<string>((resolve) => {
            setTimeout(() => {
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

import { CliProgressRunContext, TaskPoolExecutor } from './types';
import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { CliProgressTaskPoolExecutor } from './cli-progress-task-pool-executor';

export * from './types';

export const taskPoolExecutor = <TOutput, TRunContext>(
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor<TOutput, TRunContext> => {
    return new SimpleTaskPoolExecutor<TOutput, TRunContext>(props);
};

export const cliProgressTaskPoolExecutor = <TOutput>(
    props: {
        maxConcurrent: number;
        hideCursor: boolean;
        clearOnComplete: boolean;
    } = {
        maxConcurrent: 5,
        hideCursor: true,
        clearOnComplete: true
    }
): TaskPoolExecutor<TOutput, CliProgressRunContext> => {
    return new CliProgressTaskPoolExecutor<TOutput>(props);
};

export type WithCliProgress<TOutput> = (
    taskPool: TaskPoolExecutor<TOutput, CliProgressRunContext>
) => void;

export const withCliProgress = async <TOutput>(
    fn: WithCliProgress<TOutput>
) => {
    const taskPool = cliProgressTaskPoolExecutor<TOutput>();
    fn(taskPool);
    return new Promise((resolve) => {
        const timer = setInterval(async () => {
            if (taskPool.queue.length === 0 && taskPool.current.size === 0) {
                await taskPool.close();
                clearInterval(timer);
                resolve({});
            }
        }, 2);
    });
};

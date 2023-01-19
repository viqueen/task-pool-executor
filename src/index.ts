import { TaskPoolExecutor } from './types';
import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { CliProgressTaskPoolExecutor } from './cli-progress-task-pool-executor';

export * from './types';

export const taskPoolExecutor = <TOutput>(
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor<TOutput> => {
    return new SimpleTaskPoolExecutor<TOutput>(props);
};

export const cliProgressTaskPoolExecutor = <TOutput>(
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor<TOutput> => {
    return new CliProgressTaskPoolExecutor<TOutput>(props);
};

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
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor<TOutput, CliProgressRunContext> => {
    return new CliProgressTaskPoolExecutor<TOutput>(props);
};

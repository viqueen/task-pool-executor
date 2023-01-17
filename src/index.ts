import { TaskPoolExecutor } from './types';
import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { CliProgressTaskPoolExecutor } from './cli-progress-task-pool-executor';

export * from './types';

export const taskPoolExecutor = (
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor => {
    return new SimpleTaskPoolExecutor(props);
};

export const cliProgressTaskPoolExecutor = (
    props: { maxConcurrent: number } = { maxConcurrent: 5 }
): TaskPoolExecutor => {
    return new CliProgressTaskPoolExecutor(props);
};

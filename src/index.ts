/**
 * Copyright 2023 Hasnae Rehioui
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CliProgressTaskPoolExecutor } from './cli-progress-task-pool-executor';
import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { CliProgressRunContext, TaskPoolExecutor } from './types';

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

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
import {
    CliProgressRunContext,
    Runnable,
    taskPoolExecutor,
    withCliProgress
} from './index';

type RunContext = { at: Date } & CliProgressRunContext;
const executor = taskPoolExecutor<string, RunContext>({ maxConcurrent: 3 });

describe('task-pool-executor', () => {
    let task: jest.Mock;
    let delayedTask: (
        millis: number,
        runIt?: boolean
    ) => Runnable<string, RunContext>;

    beforeEach(() => {
        task = jest.fn();

        delayedTask = (millis: number, runIt = true) => {
            const run = () =>
                new Promise<any>((resolve) => {
                    setTimeout(() => {
                        if (runIt) {
                            task();
                        }
                        resolve({});
                    }, millis);
                });
            return { title: 'test', run };
        };
    });

    test('tasks are queued', async () => {
        executor.submit(delayedTask(2000));
        executor.submit(delayedTask(2000));
        executor.submit(delayedTask(2000));
        executor.submit(delayedTask(2000));

        expect(executor.queue.length).toEqual(1);
        expect(executor.current.size).toEqual(3);

        await executor.close();
        expect(executor.queue.length).toEqual(0);
        expect(task).toBeCalledTimes(3);
    });

    test('current tasks are maintained', async () => {
        executor.submit(delayedTask(2001));
        executor.submit(delayedTask(9500));
        executor.submit(delayedTask(2002));
        executor.submit(delayedTask(2003));

        expect(executor.queue.length).toEqual(1);
        expect(executor.current.size).toEqual(3);

        await delayedTask(2200, false).run();

        expect(executor.queue.length).toEqual(0);
        expect(executor.current.size).toEqual(2);

        await delayedTask(2300, false).run();

        expect(executor.queue.length).toEqual(0);
        expect(executor.current.size).toEqual(1);

        await executor.close();
        expect(executor.queue.length).toEqual(0);
        expect(executor.current.size).toEqual(0);

        expect(task).toBeCalledTimes(4);
    }, 10500);

    it('should clear when tasks are done', async () => {
        await withCliProgress<string>((taskPool) => {
            new Array(4)
                .fill(0)
                .map((_v, _index) => delayedTask(1500))
                .forEach((t) => taskPool.submit(t));
        });
        expect(task).toBeCalledTimes(4);
    });
});

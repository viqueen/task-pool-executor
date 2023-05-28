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
import { CliProgressRunContext, cliProgressTaskPoolExecutor } from '../src';

const taskPool = cliProgressTaskPoolExecutor<string>();

const delayedTask = (millis: number, title: string) => {
    const run = (ctx?: CliProgressRunContext) =>
        new Promise<string>((resolve) => {
            const interval = setInterval(() => {
                ctx?.progress.increment();
            }, 8);
            setTimeout(() => {
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

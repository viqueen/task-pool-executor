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
import { randomUUID } from 'crypto';
import EventEmitter from 'events';

import { Runnable, TaskPoolExecutor } from './types';

export class SimpleTaskPoolExecutor<TOutput, TRunContext>
    extends EventEmitter
    implements TaskPoolExecutor<TOutput, TRunContext>
{
    readonly maxConcurrent: number;
    readonly queue: Runnable<TOutput, TRunContext>[];
    readonly current: Map<string, Promise<TOutput>>;

    constructor(props: { maxConcurrent: number }) {
        super();
        this.maxConcurrent = props.maxConcurrent;
        this.queue = [];
        this.current = new Map<string, Promise<any>>();

        this.on('release', this._release);
    }

    _release(taskId: string) {
        this.current.delete(taskId);
        const runnable = this.queue.shift();
        if (runnable) {
            this._execute(randomUUID(), runnable);
        }
    }

    _execute(
        taskId: string,
        runnable: Runnable<TOutput, TRunContext>,
        ctx?: TRunContext
    ): string {
        const release = (output: TOutput) => {
            this.emit('release', taskId);
            return output;
        };
        this.current.set(
            taskId,
            runnable.run(ctx).then(release).catch(release)
        );
        return taskId;
    }

    submit(runnable: Runnable<TOutput, TRunContext>, ctx?: TRunContext) {
        const currentCount = this.current.size;
        if (currentCount < this.maxConcurrent) {
            this._execute(randomUUID(), runnable, ctx);
        } else {
            this.queue.push(runnable);
        }
    }

    async close(): Promise<TOutput[]> {
        this.queue.splice(0);
        const result = await Promise.all(this.current.values());
        this.current.clear();
        return result;
    }
}

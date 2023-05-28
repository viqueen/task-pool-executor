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
import colors from 'ansi-colors';
import { MultiBar, SingleBar, Presets } from 'cli-progress';

import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { CliProgressRunContext, Runnable } from './types';

export class CliProgressTaskPoolExecutor<
    TOutput
> extends SimpleTaskPoolExecutor<TOutput, CliProgressRunContext> {
    private readonly poolProgress: MultiBar;
    private readonly bars: Map<string, SingleBar>;
    constructor(props: {
        maxConcurrent: number;
        clearOnComplete: boolean;
        hideCursor: boolean;
    }) {
        super(props);
        this.poolProgress = new MultiBar(
            {
                format:
                    colors.redBright('{bar}') +
                    ' {percentage}% | {title} | {info}',
                clearOnComplete: props.clearOnComplete,
                hideCursor: props.hideCursor
            },
            Presets.rect
        );
        this.bars = new Map<string, SingleBar>();
    }

    _execute(
        taskId: string,
        runnable: Runnable<TOutput, CliProgressRunContext>
    ): string {
        const progress = this.poolProgress.create(100, 0, {
            title: runnable.title,
            info: ''
        });
        this.bars.set(taskId, progress);
        return super._execute(taskId, runnable, { progress });
    }

    _release(taskId: string) {
        const progress = this.bars.get(taskId);
        if (progress) {
            progress.update(100);
        }
        super._release(taskId);
    }

    async close(): Promise<TOutput[]> {
        const result = super.close();
        this.poolProgress.stop();
        return result;
    }
}

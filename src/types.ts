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
import { SingleBar } from 'cli-progress';

export type Runnable<TOutput, TRunContext> = {
    title: string;
    run: (ctx?: TRunContext) => Promise<TOutput>;
};

export interface TaskPoolExecutor<TOutput, TRunContext> {
    readonly queue: Runnable<TOutput, TRunContext>[];
    readonly current: Map<string, Promise<any>>;
    readonly maxConcurrent: number;
    submit(runnable: Runnable<TOutput, TRunContext>): void;

    close(): Promise<TOutput[]>;
}

export type CliProgressRunContext = {
    progress: SingleBar;
};

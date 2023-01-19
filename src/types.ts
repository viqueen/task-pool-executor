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

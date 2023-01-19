export type Runnable<TOutput> = {
    title: string;
    run: () => Promise<TOutput>;
};

export interface TaskPoolExecutor<TOutput> {
    readonly queue: Runnable<TOutput>[];
    readonly current: Map<string, Promise<any>>;
    readonly maxConcurrent: number;
    submit(runnable: Runnable<TOutput>): void;

    close(): Promise<TOutput[]>;
}

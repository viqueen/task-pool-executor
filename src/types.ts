export interface Runnable {
    (): Promise<any>;
}

export interface TaskPoolExecutor {
    readonly queue: Runnable[];
    readonly current: Map<string, Promise<any>>;
    readonly maxConcurrent: number;
    submit(runnable: Runnable): void;

    close(): Promise<any>;
}

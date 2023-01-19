import EventEmitter from 'events';
import { Runnable, TaskPoolExecutor } from './types';
import { randomUUID } from 'crypto';

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

import EventEmitter from 'events';
import { Runnable, TaskPoolExecutor } from './types';
import { randomUUID } from 'crypto';

export class SimpleTaskPoolExecutor<TOutput>
    extends EventEmitter
    implements TaskPoolExecutor<TOutput>
{
    readonly maxConcurrent: number;
    readonly queue: Runnable<TOutput>[];
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
            this._execute(runnable);
        }
    }

    _execute(runnable: Runnable<TOutput>): string {
        const taskId = randomUUID();
        const release = (output: TOutput) => {
            this.emit('release', taskId);
            return output;
        };
        this.current.set(taskId, runnable.run().then(release).catch(release));
        return taskId;
    }

    submit(runnable: Runnable<TOutput>) {
        const currentCount = this.current.size;
        if (currentCount < this.maxConcurrent) {
            this._execute(runnable);
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

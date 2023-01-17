import EventEmitter from 'events';
import { Runnable, TaskPoolExecutor } from './types';
import { randomUUID } from 'crypto';

export class SimpleTaskPoolExecutor
    extends EventEmitter
    implements TaskPoolExecutor
{
    readonly maxConcurrent: number;
    readonly queue: Runnable[];
    readonly current: Map<string, Promise<any>>;

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

    _execute(runnable: Runnable): string {
        const taskId = randomUUID();
        this.current.set(
            taskId,
            runnable()
                .then(() => this.emit('release', taskId))
                .catch(() => this.emit('release', taskId))
        );
        return taskId;
    }

    submit(runnable: Runnable) {
        const currentCount = this.current.size;
        if (currentCount < this.maxConcurrent) {
            this._execute(runnable);
        } else {
            this.queue.push(runnable);
        }
    }

    close(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.queue.splice(0);
            Promise.all(this.current.values()).then(() => {
                resolve({});
                this.current.clear();
            });
        });
    }
}

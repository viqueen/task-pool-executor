import EventEmitter from 'events';
import { randomUUID } from 'crypto';

export interface Task {
    (): Promise<any>;
}

export interface TaskExecutor {
    readonly queue: Array<Task>;
    readonly maxConcurrent: number;
    submit(task: Task): void;

    close(): Promise<any>;
}

export class DefaultTaskExecutor extends EventEmitter implements TaskExecutor {
    readonly maxConcurrent!: number;
    readonly queue!: Array<Task>;
    readonly current!: Map<string, Promise<any>>;

    constructor(maxConcurrent: number = 5) {
        super();
        this.maxConcurrent = maxConcurrent;
        this.queue = [];
        this.current = new Map<string, Promise<any>>();

        this.on('release', this._release);
    }

    _release(taskId: string) {
        this.current.delete(taskId);

        const task = this.queue.shift();
        if (task) {
            this._runTask(task);
        }
    }

    _runTask(task: Task) {
        const taskId = randomUUID();
        this.current.set(
            taskId,
            task()
                .then(() => {
                    this.emit('release', taskId);
                })
                .catch(() => {
                    this.emit('release', taskId);
                })
        );
    }

    submit(task: Task): void {
        const currentCount = this.current.size;
        if (currentCount < this.maxConcurrent) {
            this._runTask(task);
        } else {
            this.queue.push(task);
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

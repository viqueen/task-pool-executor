import EventEmitter from 'events';

interface Task {
    (): Promise<any>;
}

interface TaskExecutor {
    readonly queue: Array<Task>;
    readonly maxConcurrent: number;
    submit(task: Task): void;

    close(): Promise<any>;
}

export class DefaultTaskExecutor extends EventEmitter implements TaskExecutor {
    readonly maxConcurrent!: number;
    readonly queue!: Array<Task>;
    readonly current!: Array<Promise<any>>;
    currentCount!: number;

    constructor(maxConcurrent: number = 5) {
        super();
        this.maxConcurrent = maxConcurrent;
        this.queue = [];
        this.current = [];
        this.currentCount = 0;

        this.on('release', this._release);
    }

    _release() {
        this.currentCount = this.currentCount - 1;
        const task = this.queue.shift();
        if (task) {
            this._runTask(this.currentCount, task);
        }
    }

    _runTask(index: number, task: Task) {
        this.current[index] = task()
            .then(() => {
                this.emit('release');
            })
            .catch(() => {
                // TODO : retry
                this.emit('release');
            });
    }

    submit(task: Task): void {
        if (this.currentCount < this.maxConcurrent) {
            this.currentCount = this.currentCount + 1;
            this._runTask(this.currentCount, task);
        } else {
            this.queue.push(task);
        }
    }

    close(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.queue.splice(0);
            Promise.all(this.current).then(() => {
                resolve({});
            });
        });
    }
}

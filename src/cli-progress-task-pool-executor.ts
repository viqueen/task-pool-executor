import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';

export class CliProgressTaskPoolExecutor extends SimpleTaskPoolExecutor {
    constructor(props: { maxConcurrent: number }) {
        super(props);
    }
}

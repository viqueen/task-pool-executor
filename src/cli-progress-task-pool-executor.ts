import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';

export class CliProgressTaskPoolExecutor<
    TOutput
> extends SimpleTaskPoolExecutor<TOutput> {
    constructor(props: { maxConcurrent: number }) {
        super(props);
    }
}

import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { MultiBar, SingleBar, Presets } from 'cli-progress';
import { Runnable } from './types';
import colors from 'ansi-colors';

export class CliProgressTaskPoolExecutor<
    TOutput
> extends SimpleTaskPoolExecutor<TOutput> {
    private readonly progress: MultiBar;
    private readonly bars: Map<string, SingleBar>;
    constructor(props: { maxConcurrent: number }) {
        super(props);
        this.progress = new MultiBar(
            {
                format: colors.cyan('{bar}') + ' {percentage}% | {title}'
            },
            Presets.rect
        );
        this.bars = new Map<string, SingleBar>();
    }

    _execute(taskId: string, runnable: Runnable<TOutput>): string {
        const bar = this.progress.create(100, 0, { title: runnable.title });
        this.bars.set(taskId, bar);
        return super._execute(taskId, runnable);
    }

    _release(taskId: string) {
        const bar = this.bars.get(taskId);
        if (bar) {
            bar.update(100);
        }
        super._release(taskId);
    }

    async close(): Promise<TOutput[]> {
        const result = super.close();
        this.progress.stop();
        return result;
    }
}

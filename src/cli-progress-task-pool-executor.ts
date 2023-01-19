import { SimpleTaskPoolExecutor } from './simple-task-pool-executor';
import { MultiBar, SingleBar, Presets } from 'cli-progress';
import { CliProgressRunContext, Runnable } from './types';
import colors from 'ansi-colors';

export class CliProgressTaskPoolExecutor<
    TOutput
> extends SimpleTaskPoolExecutor<TOutput, CliProgressRunContext> {
    private readonly poolProgress: MultiBar;
    private readonly bars: Map<string, SingleBar>;
    constructor(props: { maxConcurrent: number }) {
        super(props);
        this.poolProgress = new MultiBar(
            {
                format:
                    colors.redBright('{bar}') +
                    ' {percentage}% | {title} | {info}',
                clearOnComplete: true,
                hideCursor: true
            },
            Presets.rect
        );
        this.bars = new Map<string, SingleBar>();
    }

    _execute(
        taskId: string,
        runnable: Runnable<TOutput, CliProgressRunContext>
    ): string {
        const progress = this.poolProgress.create(100, 0, {
            title: runnable.title,
            info: ''
        });
        this.bars.set(taskId, progress);
        return super._execute(taskId, runnable, { progress });
    }

    _release(taskId: string) {
        const progress = this.bars.get(taskId);
        if (progress) {
            progress.update(100);
        }
        super._release(taskId);
    }

    async close(): Promise<TOutput[]> {
        const result = super.close();
        this.poolProgress.stop();
        return result;
    }
}

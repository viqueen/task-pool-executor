import { DefaultTaskExecutor } from './DefaultTaskExecutor';

const executor = new DefaultTaskExecutor(3);

const task = jest.fn();

const delayedTask = (millis: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            task();
            resolve({});
        }, millis);
    });
};

test('tasks are queued', async () => {
    executor.submit(() => delayedTask(2000));
    executor.submit(() => delayedTask(2000));
    executor.submit(() => delayedTask(2000));
    executor.submit(() => delayedTask(2000));

    expect(executor.currentCount).toEqual(3);
    expect(executor.queue.length).toEqual(1);

    await executor.close();
    expect(executor.queue.length).toEqual(0);
    expect(task).toBeCalledTimes(3);
});

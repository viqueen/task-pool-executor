## task-pool-executor

Just a simple executor to orchestrate a set of asynchronous tasks

```bash
npm install task-pool-executor --save
```

```javascript
import { DefaultTaskExecutor } from "./DefaultTaskExecutor";

const executor = new DefaultTaskExecutor(3);
executor.submit(() => {
  return Promise.resolve();
});

await executor.close();
```

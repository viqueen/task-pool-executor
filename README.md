## task-pool-executor

Just a simple executor to orchestrate a set of asynchronous tasks

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=viqueen_task-pool-executor&metric=alert_status)](https://sonarcloud.io/dashboard?id=viqueen_task-pool-executor)

### install it

```bash
npm install task-pool-executor --save
```

### use it

```javascript
import { DefaultTaskExecutor } from "./DefaultTaskExecutor";

const executor = new DefaultTaskExecutor(3);
executor.submit(() => {
  return Promise.resolve();
});

await executor.close();
```

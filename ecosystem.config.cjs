module.exports = {
  apps: [
    {
      name: 'workflow',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=workflow-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'gsk-eyJjb2dlbl9pZCI6ICIwZDM3NmI3OC1kOTI3LTQ0NGUtOWYxNS1lYzNhNmU2YTUyNzEiLCAia2V5X2lkIjogIjYxMmE2MjQzLTI5YzYtNDRhZC04ZmU1LThhZWNjMzQxNTczOSJ9fA9JeHW2Mfe8xbHlZfRe7aL7_rfEuN_mDuELuoJtHQvZ',
        OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}

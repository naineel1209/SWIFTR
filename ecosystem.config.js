module.exports = {
    apps: [
        {
            name: 'swiftr',
            script: 'app.js',
            env: {
                NODE_ENV: 'production'
            },
            autorestart: true,
        },
        {
            name: 'redis-server',
            script: 'redis-server',
            args: '--port 6379',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G'
        }
    ]
};

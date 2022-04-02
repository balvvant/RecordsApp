module.exports = {
  apps: [
    {
      name: "liberate",
      script: "./app.js",
      watch: false,
      instances: "max",
      exec_mode: "cluster",
    }
  ],
};

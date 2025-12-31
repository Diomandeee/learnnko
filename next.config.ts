module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  env: {
    // Analyzer backend URL - used in API routes to proxy to Cloud Run
    // This is the production cc-music-pipeline backend deployed on GCP
    ANALYZER_BACKEND_URL: process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app',
  },
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Una sola señal canónica: todo AK Cloud bajo www.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'akcloud.es' }],
        destination: 'https://www.akcloud.es/:path*',
        permanent: true,
      },

      // Consolidación de landings inglesas legacy / muy solapadas.
      // Concentramos autoridad en las URLs comerciales que sí mantenemos en sitemap.
      { source: '/en/ecu-file-service/diesel-tuning', destination: '/en/ecu-file-service/diesel-ecu-tuning-files', permanent: true },
      { source: '/en/ecu-file-service/turbo-diesel-tuning', destination: '/en/ecu-file-service/diesel-ecu-tuning-files', permanent: true },
      { source: '/en/ecu-file-service/petrol-tuning', destination: '/en/ecu-file-service/petrol-tuning-files', permanent: true },
      { source: '/en/ecu-file-service/turbo-petrol-tuning', destination: '/en/ecu-file-service/petrol-tuning-files', permanent: true },
      { source: '/en/ecu-file-service/online-tuning', destination: '/en/ecu-file-service/tuning-files-online', permanent: true },
      { source: '/en/ecu-file-service/tuning-files', destination: '/en/ecu-file-service/tuning-files-online', permanent: true },
      { source: '/en/ecu-file-service/remapping-files', destination: '/en/ecu-file-service', permanent: true },
      { source: '/en/ecu-file-service/ecu-remap', destination: '/en/ecu-file-service', permanent: true },
      { source: '/en/ecu-file-service/ecu-remap-files', destination: '/en/ecu-file-service', permanent: true },
      { source: '/en/ecu-file-service/professional-remapping', destination: '/en/ecu-file-service', permanent: true },
      { source: '/en/ecu-file-service/ecu-calibration', destination: '/en/ecu-file-service/custom-tuning', permanent: true },
      { source: '/en/ecu-file-service/custom-tuning-files', destination: '/en/ecu-file-service/custom-tuning', permanent: true },
      { source: '/en/ecu-file-service/performance-tuning-files', destination: '/en/ecu-file-service/performance-tuning', permanent: true },
      { source: '/en/ecu-file-service/stage-1-tuning-files', destination: '/en/stage-1-file-service', permanent: true },
      { source: '/en/ecu-file-service/tuning-for-tuners', destination: '/en/ecu-file-service/tuners', permanent: true },
      { source: '/en/ecu-file-service/remap-files-for-tuners', destination: '/en/ecu-file-service/tuners', permanent: true },
      { source: '/en/ecu-file-service/tuning-file-provider', destination: '/en/ecu-file-service/tuners', permanent: true },
      { source: '/en/ecu-file-service/tuning-file-supplier', destination: '/en/ecu-file-service/tuners', permanent: true },
      { source: '/en/ecu-file-service/garages', destination: '/en/ecu-file-service/workshops', permanent: true },
      { source: '/en/ecu-file-service/car-tuning', destination: '/en/ecu-file-service', permanent: true },
      { source: '/en/ecu-file-service/chiptuning', destination: '/en/ecu-file-service', permanent: true },
    ]
  },
}

module.exports = nextConfig

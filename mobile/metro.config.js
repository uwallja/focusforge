const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname),
  '~': path.resolve(__dirname),
};

// Enable package.json exports resolution (needed by @supabase/supabase-js subpaths)
config.resolver.unstable_enablePackageExports = true;

// Cloud dev servers run rnrun (Metro-free); this config only matters for a
// local `expo start`, where stock behavior is exactly right.
module.exports = withNativeWind(config, { input: './global.css' });

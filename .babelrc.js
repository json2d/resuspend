module.exports = function(api) {
  const isDev = api.caller(
    caller => caller && caller.target === 'node' && caller.isDev
  );

  const plugins = [];

  if (!isDev) {
    // Only add the transform-remove-console plugin in production
    plugins.push('transform-remove-console');
  }

  return {
    plugins,
  };
};

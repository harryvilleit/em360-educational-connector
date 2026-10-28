/* Shared, framework-independent navigation rules. No credentials are stored here. */
(() => {
  'use strict';
  const id = (value) => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
  const safePath = (value) => typeof value === 'string' && /^\/dashboard(?:\/[a-zA-Z0-9_-]+)*$/.test(value);
  const normalize = (data) => {
    if (data?.navigationVersion !== 1 || !Array.isArray(data.navigation?.modules)) return null;
    const modules = data.navigation.modules.filter(m => id(m.id) && typeof m.name === 'string' && Array.isArray(m.menus)).map(m => ({
      id: m.id, name: m.name, description: typeof m.description === 'string' ? m.description : '',
      menus: m.menus.filter(menu => id(menu.id) && typeof menu.name === 'string' && safePath(menu.path) &&
        Array.isArray(menu.permissions) && menu.permissions.includes('View')).map(menu => ({
        id: menu.id, name: menu.name, path: menu.path,
        permissions: menu.permissions.filter(p => ['View', 'Create', 'Update', 'Delete'].includes(p)),
      })),
    })).filter(m => m.menus.length);
    return { modules, defaultModuleId: data.navigation.defaultModuleId, defaultMenuId: data.navigation.defaultMenuId };
  };
  const selection = (navigation, hash) => {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const module = navigation.modules.find(m => m.id === params.get('em360-module')) ||
      navigation.modules.find(m => m.id === navigation.defaultModuleId);
    if (!module) return { module: null, menu: null };
    const menu = module.menus.find(m => m.id === params.get('em360-menu')) ||
      module.menus.find(m => m.id === navigation.defaultMenuId) || module.menus[0];
    return { module, menu };
  };
  const hash = (module, menu) => '#' + new URLSearchParams({ 'em360-module': module, 'em360-menu': menu });
  const launch = (frontend, school, module, menu) => {
    if (![school, module, menu].every(id)) throw new Error('Invalid school menu. Refresh your portal.');
    const base = new URL(frontend);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('Configure the HTTPS EM360 website address.');
    const destination = new URL(base.href.replace(/\/$/, '') + '/wordpress/launch');
    destination.search = new URLSearchParams({ school, module, menu }).toString();
    return destination.href;
  };
  globalThis.EM360Navigation = Object.freeze({ normalize, selection, hash, launch });
})();

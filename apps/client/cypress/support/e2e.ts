import 'cypress-axe';
import './commands'

const fakeCoords = (
  lat = 40.7801,
  lon = -73.968767,
) => ({
  coords: { latitude: lat, longitude: lon, accuracy: 25 },
  timestamp: Date.now(),
});

function wireGeolocation(win: Window, lat?: number, lon?: number) {
  const pos = fakeCoords(lat, lon);

  // ----- 1. Stub the plain Web API (Capacitor’s web layer calls this) -----
  if (win.navigator?.geolocation) {
    const geo = win.navigator.geolocation;

    if (!geo.getCurrentPosition?.isSinonProxy) {
      cy.stub(geo, 'getCurrentPosition').callsFake(cb => cb(pos));
    }

    if (!geo.watchPosition?.isSinonProxy) {
      cy.stub(geo, 'watchPosition').callsFake(cb => {
        cb(pos);
        return 1; // watch-ID
      });
    }
  }

  // ----- 2. Short-circuit the permissions poll ---------------------------
  if (win.navigator?.permissions?.query && !win.navigator.permissions.query.isSinonProxy) {
    cy.stub(win.navigator.permissions, 'query').callsFake(({ name }) =>
      name === 'geolocation'
        ? Promise.resolve({ state: 'granted' })
        : win.navigator.permissions.query({ name }),
    );
  }

  // ----- 3. Replace the Capacitor proxy with a dead-simple object ---------
  win.Capacitor = win.Capacitor || ({} as any);
  win.Capacitor.Plugins = win.Capacitor.Plugins || {};
  win.Capacitor.Plugins.Geolocation = {
    getCurrentPosition: () => Promise.resolve(pos),
    watchPosition: (_opts: any, cb: any) => {
      if (typeof cb === 'function') cb(pos);
      return 'watch-1';
    },
    clearWatch: () => {},
  };

  // Some code imports the default export instead of Plugins.*
  win.Geolocation = win.Capacitor.Plugins.Geolocation;
}

Cypress.Commands.overwrite(
  'visit',
  (originalVisit, url: string, options: Partial<Cypress.VisitOptions> = {}) => {
    const withStub = {
      ...options,
      onBeforeLoad(win: Window) {
        wireGeolocation(win);           // use defaults; override per-test if needed
        options.onBeforeLoad?.(win);    // keep user-supplied hook
      },
    };
    return originalVisit(url, withStub);
  },
);

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null (reading 'classList')")) {
    // ignore the gestureController bug
    return false;
  }
});


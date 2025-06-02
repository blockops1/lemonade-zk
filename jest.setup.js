// Mock WebAssembly
global.WebAssembly = {
  instantiate: jest.fn(),
  compile: jest.fn(),
  instantiateStreaming: jest.fn(),
  compileStreaming: jest.fn(),
  validate: jest.fn(),
  Memory: jest.fn(),
  Table: jest.fn(),
  Instance: jest.fn(),
  Module: jest.fn()
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  })
);

// Console logging control
const originalConsole = { ...console };
beforeAll(() => {
  if (!process.env.DEBUG) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
    // Keep console.warn and console.error for test debugging
  }
});

afterAll(() => {
  Object.assign(console, originalConsole);
}); 
const React = require('react');
const { vi } = require('vitest');
const mockNavigate = vi.fn();

module.exports = {
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  __mockNavigate: mockNavigate,
};

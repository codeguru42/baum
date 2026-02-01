const React = require('react');
const mockNavigate = jest.fn();

module.exports = {
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  __mockNavigate: mockNavigate,
};

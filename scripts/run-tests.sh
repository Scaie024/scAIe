#!/bin/bash

# Run unit and integration tests
echo "Running unit and integration tests..."
npm test -- --coverage

# Run accessibility tests
echo "Running accessibility tests..."
npm test -- __tests__/a11y/ --coverage=false

# Run E2E tests if Cypress is installed
if [ -d "cypress" ]; then
  echo "Running E2E tests..."
  npx cypress run
fi

echo "All tests completed!"

const unique = () => Date.now().toString().slice(-7);

/** Data factory: fresh, unique employee data on every call */
export function newEmployee(overrides: Partial<{ firstName: string; lastName: string; employeeId: string }> = {}) {
  const id = unique();
  return { firstName: `Auto${id}`, lastName: 'Tester', employeeId: id, ...overrides };
}

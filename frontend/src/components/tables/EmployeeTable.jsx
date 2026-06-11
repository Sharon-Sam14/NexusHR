
export default function EmployeeTable({ employees }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="pb-4">Name</th>
            <th className="pb-4">Email</th>
            <th className="pb-4">Department</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-white/5">
              <td className="py-4">{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState } from 'react';

const TaskList = ({ tasks }) => {
  const [filter, setFilter] = useState('all');

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.type === filter);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-base sm:text-lg font-semibold">Pending Tasks</h3>
          <div className="flex flex-wrap gap-2">
            {['all', 'kyc', 'ocr', 'site_visit'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TAT Remaining</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.type === 'kyc' ? 'bg-purple-100 text-purple-800' :
                    task.type === 'ocr' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">{task.customer}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    task.tatRemaining < 2 ? 'text-red-600' :
                    task.tatRemaining < 6 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {task.tatRemaining}h
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.priority === 'high'   ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-900">Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden divide-y divide-gray-200">
        {filteredTasks.map((task) => (
          <div key={task.id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">{task.id}</span>
              <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${
                task.priority === 'high'   ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${
                task.type === 'kyc' ? 'bg-purple-100 text-purple-800' :
                task.type === 'ocr' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {task.type.toUpperCase()}
              </span>
              <span className="text-sm text-gray-700">{task.customer}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${
                task.tatRemaining < 2 ? 'text-red-600' :
                task.tatRemaining < 6 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                TAT: {task.tatRemaining}h remaining
              </span>
              <div className="flex gap-3 text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900">View</button>
                <button className="text-green-600 hover:text-green-900">Complete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
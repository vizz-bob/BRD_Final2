import React from 'react';
import { AlertCircle } from 'lucide-react';

const SLAAlerts = ({ alerts }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="text-red-500 shrink-0" size={20} />
        SLA Breach Alerts
      </h3>
      <div className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No SLA alerts at this time.
          </p>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-3 sm:p-4 rounded-r-lg ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'high'     ? 'border-orange-500 bg-orange-50' :
                                              'border-yellow-500 bg-yellow-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {alert.task_id ?? alert.taskId}
                  </h4>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high'     ? 'bg-orange-100 text-orange-800' :
                                                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{alert.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                  <span>SLA: {alert.sla_target ?? alert.slaTarget}h</span>
                  <span>Elapsed: {alert.elapsed}h</span>
                  <span className="text-red-600 font-medium">
                    Overdue by {alert.overdue}h
                  </span>
                </div>
              </div>
              <button className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                Escalate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SLAAlerts;
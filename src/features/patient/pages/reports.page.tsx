import { GuestLayout } from '@/components/layouts';
import { FileText, Download, Eye, Calendar } from 'lucide-react';

const ReportsPage = () => {
  const reports = [
    {
      id: 1,
      date: 'Jan 15, 2026',
      type: 'Retinal Screening',
      result: 'Healthy',
      riskLevel: 'Low',
      doctor: 'Dr. Smith',
      color: 'green',
    },
    {
      id: 2,
      date: 'Dec 10, 2025',
      type: 'Follow-up Scan',
      result: 'Normal',
      riskLevel: 'Low',
      doctor: 'Dr. Johnson',
      color: 'blue',
    },
    {
      id: 3,
      date: 'Nov 5, 2025',
      type: 'Initial Screening',
      result: 'Healthy',
      riskLevel: 'Low',
      doctor: 'Dr. Williams',
      color: 'green',
    },
  ];

  return (
    <GuestLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Medical Reports
        </h1>
        <p className="text-gray-600">
          View and download your screening reports
        </p>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`h-12 w-12 bg-${report.color}-100 rounded-xl flex items-center justify-center shrink-0`}
                >
                  <FileText className={`h-6 w-6 text-${report.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {report.type}
                    </h3>
                    <span
                      className={`text-xs font-medium text-${report.color}-600 bg-${report.color}-100 px-3 py-1 rounded-full`}
                    >
                      {report.result}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Risk: {report.riskLevel}</span>
                    </div>
                    <div className="text-gray-600">Doctor: {report.doctor}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GuestLayout>
  );
};

export default ReportsPage;

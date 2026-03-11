import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Target,
  Heart,
  Activity,
  Pill,
  Eye,
  TrendingUp,
  Download,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'missed';
  type: 'checkup' | 'screening' | 'lifestyle' | 'medication';
}

interface Recommendation {
  id: string;
  category: 'diet' | 'exercise' | 'medication' | 'lifestyle' | 'monitoring';
  title: string;
  description: string;
  frequency: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

const mockRoadmap = {
  id: '1',
  title: 'Post-Screening Eye Health Plan',
  description:
    'Personalized care plan based on your recent screening results and diagnosis.',
  startDate: 'Jan 20, 2026',
  progress: 65,
  status: 'active',
};

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    description: 'Complete first consultation with assigned ophthalmologist',
    targetDate: 'Jan 22, 2026',
    status: 'completed',
    type: 'checkup',
  },
  {
    id: '2',
    title: 'Follow-up Screening',
    description: 'Upload new retinal images for progress tracking',
    targetDate: 'Feb 5, 2026',
    status: 'in-progress',
    type: 'screening',
  },
  {
    id: '3',
    title: 'OCT Scan',
    description: 'Schedule and complete OCT scan at partner clinic',
    targetDate: 'Feb 15, 2026',
    status: 'pending',
    type: 'checkup',
  },
  {
    id: '4',
    title: 'Lifestyle Assessment',
    description: 'Complete 30-day lifestyle modification program',
    targetDate: 'Feb 28, 2026',
    status: 'pending',
    type: 'lifestyle',
  },
  {
    id: '5',
    title: '3-Month Review',
    description: 'Comprehensive review with ophthalmologist',
    targetDate: 'Apr 20, 2026',
    status: 'pending',
    type: 'checkup',
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    category: 'monitoring',
    title: 'Blood Pressure Monitoring',
    description: 'Track your blood pressure daily to help manage eye health',
    frequency: 'Daily',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: '2',
    category: 'diet',
    title: 'Increase Omega-3 Intake',
    description: 'Include fish, walnuts, and flaxseed in your diet',
    frequency: '3-4 times/week',
    priority: 'medium',
    isCompleted: true,
  },
  {
    id: '3',
    category: 'exercise',
    title: 'Regular Eye Exercises',
    description:
      '20-20-20 rule: Every 20 min, look at something 20 feet away for 20 seconds',
    frequency: 'Every 20 minutes',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: '4',
    category: 'lifestyle',
    title: 'Reduce Screen Time',
    description: 'Limit screen exposure to 8 hours daily with regular breaks',
    frequency: 'Daily',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: '5',
    category: 'monitoring',
    title: 'Blood Sugar Tracking',
    description: 'Monitor glucose levels if diabetic or pre-diabetic',
    frequency: 'Daily',
    priority: 'high',
    isCompleted: true,
  },
];

export default function RoadmapPage() {
  const [_selectedMilestone, _setSelectedMilestone] = useState<string | null>(
    null
  );
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const toggleRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, isCompleted: !rec.isCompleted } : rec
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'missed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return <Eye className="w-5 h-5" />;
      case 'screening':
        return <Activity className="w-5 h-5" />;
      case 'lifestyle':
        return <Heart className="w-5 h-5" />;
      case 'medication':
        return <Pill className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diet':
        return '🥗';
      case 'exercise':
        return '🏃';
      case 'medication':
        return '💊';
      case 'lifestyle':
        return '🌟';
      case 'monitoring':
        return '📊';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Health Improvement Roadmap
        </h1>
        <p className="text-(--text-secondary)">
          Your personalized care plan based on diagnosis and recommendations
        </p>
      </div>

      {/* Roadmap Overview */}
      <div className="medical-card bg-brand-soft border-brand/20 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-(--text-primary)">
                {mockRoadmap.title}
              </h2>
              <p className="text-(--text-secondary)">
                {mockRoadmap.description}
              </p>
              <p className="text-sm text-brand mt-1">
                Started: {mockRoadmap.startDate}
              </p>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-(--text-secondary)">
            Overall Progress
          </span>
          <span className="text-sm font-medium text-(--text-primary)">
            {mockRoadmap.progress}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#1e3a5f] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
            style={{ width: `${mockRoadmap.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0d2137] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-6">
              Care Milestones
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#1e3a5f]" />

              <div className="space-y-6">
                {mockMilestones.map((milestone, _index) => (
                  <div key={milestone.id} className="relative flex gap-4">
                    {/* Timeline Dot */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        milestone.status === 'completed'
                          ? 'bg-green-500/20'
                          : milestone.status === 'in-progress'
                            ? 'bg-blue-500/20'
                            : 'bg-[#1e3a5f]'
                      }`}
                    >
                      {getTypeIcon(milestone.type)}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 p-4 rounded-xl border transition-all ${
                        milestone.status === 'completed'
                          ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                          : milestone.status === 'in-progress'
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                            : 'bg-gray-50 dark:bg-[#1e3a5f]/30 border-gray-200 dark:border-[#2d4a6f]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-(--text-primary) font-medium">
                            {milestone.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {milestone.description}
                          </p>
                        </div>
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {milestone.targetDate}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            milestone.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : milestone.status === 'in-progress'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {milestone.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d2137] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Daily Recommendations
              </h2>
              <span className="text-sm text-gray-400">
                {recommendations.filter((r) => r.isCompleted).length}/
                {recommendations.length} done
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => toggleRecommendation(rec.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    rec.isCompleted
                      ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 opacity-70'
                      : 'bg-white dark:bg-[#1e3a5f]/30 border-gray-200 dark:border-[#2d4a6f] hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        rec.isCompleted
                          ? 'border-green-400 bg-green-400'
                          : 'border-gray-500'
                      }`}
                    >
                      {rec.isCompleted && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getCategoryIcon(rec.category)}</span>
                        <p
                          className={`font-medium ${
                            rec.isCompleted
                              ? 'text-(--text-muted) line-through'
                              : 'text-(--text-primary)'
                          }`}
                        >
                          {rec.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {rec.frequency}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Great Progress!</h3>
                <p className="text-sm text-gray-400">Keep up the good work</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              You've completed 65% of your health roadmap. Continue following
              the recommendations to maintain optimal eye health.
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

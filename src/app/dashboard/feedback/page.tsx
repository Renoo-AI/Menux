'use client';

import { useState } from 'react';
import { Star, TrendingUp, MessageSquare, ThumbsUp, Download, BarChart3, PieChart } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { TopAppBar } from '@/components/layout';
import { FeedbackCard, FeedbackStats, RatingStars } from '@/components/feedback-system';
import type { FeedbackRating } from '@/components/feedback-system';

// Demo feedback data
const demoFeedbacks: FeedbackRating[] = [
  {
    id: '1',
    orderId: 'order-1',
    tableName: 'Table 01',
    rating: 5,
    categories: { food: 5, service: 5, ambiance: 4, value: 5 },
    comment: 'Amazing experience! The truffle pasta was incredible and the service was impeccable.',
    wouldRecommend: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    orderId: 'order-2',
    tableName: 'Table 05',
    rating: 4,
    categories: { food: 4, service: 5, ambiance: 4, value: 4 },
    comment: 'Great food and atmosphere. Will definitely come back!',
    wouldRecommend: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    orderId: 'order-3',
    tableName: 'Table 12',
    rating: 3,
    categories: { food: 4, service: 2, ambiance: 4, value: 3 },
    comment: 'Food was good but service was slow during peak hours.',
    wouldRecommend: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '4',
    orderId: 'order-4',
    tableName: 'Table 08',
    rating: 5,
    categories: { food: 5, service: 5, ambiance: 5, value: 5 },
    wouldRecommend: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '5',
    orderId: 'order-5',
    tableName: 'Table 03',
    rating: 4,
    categories: { food: 4, service: 4, ambiance: 5, value: 3 },
    comment: 'Beautiful ambiance! Prices are a bit high but quality justifies it.',
    wouldRecommend: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

const ratingDistribution = [
  { rating: 5, count: 45, percentage: 45 },
  { rating: 4, count: 32, percentage: 32 },
  { rating: 3, count: 15, percentage: 15 },
  { rating: 2, count: 6, percentage: 6 },
  { rating: 1, count: 2, percentage: 2 },
];

const categoryAverages = [
  { name: 'Food Quality', score: 4.6, maxScore: 5 },
  { name: 'Service', score: 4.4, maxScore: 5 },
  { name: 'Ambiance', score: 4.7, maxScore: 5 },
  { name: 'Value for Money', score: 4.2, maxScore: 5 },
];

export default function FeedbackPage() {
  const [feedbacks] = useState<FeedbackRating[]>(demoFeedbacks);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'positive') return f.rating >= 4;
    if (filter === 'negative') return f.rating < 4;
    return true;
  });

  return (
    <DashboardLayout>
      <TopAppBar
        title="Customer Feedback"
        subtitle="Reviews & ratings"
        showSearch={false}
        user={{ name: 'Manager', role: 'manager' }}
      />

      <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
        {/* Stats Overview */}
        <FeedbackStats feedbacks={feedbacks} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-title-sm text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                Rating Distribution
              </h3>
              <span className="text-on-surface-variant text-sm">100 reviews</span>
            </div>
            <div className="space-y-4">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <Star className={`w-4 h-4 ${rating >= 4 ? 'fill-amber-400 text-amber-400' : 'text-outline-variant'}`} />
                    <span className="font-medium text-primary">{rating}</span>
                  </div>
                  <div className="flex-1 h-3 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rating >= 4 ? 'bg-secondary' : rating >= 3 ? 'bg-amber-500' : 'bg-error'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-on-surface-variant text-sm w-12 text-right">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-title-sm text-primary flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                Category Scores
              </h3>
              <span className="text-on-surface-variant text-sm">Avg: 4.5</span>
            </div>
            <div className="space-y-5">
              {categoryAverages.map(({ name, score, maxScore }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      <RatingStars value={Math.round(score)} size="sm" readonly />
                      <span className="font-bold text-primary">{score.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-title-sm text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Rating Trend
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm focus:border-secondary focus:ring-2 focus:ring-secondary-fixed/20"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          {/* Simple Trend Visualization */}
          <div className="flex items-end justify-between h-40 px-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const height = [65, 70, 60, 75, 85, 90, 80][i];
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 bg-gradient-to-t from-secondary to-secondary-fixed rounded-t-lg transition-all duration-300 hover:from-accent hover:to-accent"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-on-surface-variant">{day}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full" />
              <span className="text-sm text-on-surface-variant">Avg Rating</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12% vs last week</span>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-headline-sm text-primary">Recent Feedback</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('positive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'positive' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Positive
                </button>
                <button
                  onClick={() => setFilter('negative')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'negative' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Needs Attention
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>

          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="font-display text-title-sm text-primary mb-2">No feedback found</h3>
              <p className="text-on-surface-variant">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaComments, FaPoll, FaCalendar } from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown  } from 'react-icons/fi';

const AnalyticsChart = ({ data, type = 'bar', title, subtitle }) => {
  const [chartData, setChartData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const max = Math.max(...data.map(item => item.value));
      setMaxValue(max);
      setChartData(data);
    }
  }, [data]);

  const renderBarChart = () => (
    <div className="space-y-3">
      {chartData.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const colorClass = index === 0 ? 'bg-primary-500' : 
                          index === 1 ? 'bg-secondary-500' : 
                          index === 2 ? 'bg-success-500' : 
                          index === 3 ? 'bg-warning-500' : 'bg-gray-400';
        
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
              <div
                className={`h-6 rounded-full transition-all duration-1000 ${colorClass}`}
                style={{ width: `${percentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y, index) => (
          <line
            key={index}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgb(229, 231, 235)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          points={chartData.map((item, index) => 
            `${(index / (chartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
          ).join(' ')}
        />
        
        {/* Area fill */}
        <polygon
          fill="url(#lineGradient)"
          points={`0,100 ${chartData.map((item, index) => 
            `${(index / (chartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
          ).join(' ')} 100,100`}
        />
        
        {/* Data points */}
        {chartData.map((item, index) => (
          <circle
            key={index}
            cx={(index / (chartData.length - 1)) * 100}
            cy={100 - (item.value / maxValue) * 100}
            r="2"
            fill="rgb(59, 130, 246)"
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {chartData.map((item, index) => (
          <span key={index} className="text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) : 0;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const colorClass = index === 0 ? 'fill-primary-500' : 
                              index === 1 ? 'fill-secondary-500' : 
                              index === 2 ? 'fill-success-500' : 
                              index === 3 ? 'fill-warning-500' : 'fill-gray-400';
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                className={colorClass}
              />
            );
          })}
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  const getTrendIcon = () => {
    if (chartData.length < 2) return null;
    
    const recent = chartData[chartData.length - 1]?.value || 0;
    const previous = chartData[chartData.length - 2]?.value || 0;
    
    if (recent > previous) {
      return <FiTrendingUp  className="text-green-500" />;
    } else if (recent < previous) {
      return <FiTrendingDown className="text-red-500" />;
    }
    return null;
  };

  const getTrendText = () => {
    if (chartData.length < 2) return '';
    
    const recent = chartData[chartData.length - 1]?.value || 0;
    const previous = chartData[chartData.length - 2]?.value || 0;
    
    if (recent > previous) {
      const increase = ((recent - previous) / previous * 100).toFixed(1);
      return `+${increase}% from last period`;
    } else if (recent < previous) {
      const decrease = ((previous - recent) / previous * 100).toFixed(1);
      return `-${decrease}% from last period`;
    }
    return 'No change from last period';
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <FaChartBar className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-primary-600" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {getTrendIcon() && (
            <div className="flex items-center gap-2 text-sm">
              {getTrendIcon()}
              <span className="text-gray-600 dark:text-gray-400">
                {getTrendText()}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        {renderChart()}
        
        {/* Legend */}
        {type === 'pie' && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            {chartData.map((item, index) => {
              const colorClass = index === 0 ? 'bg-primary-500' : 
                                index === 1 ? 'bg-secondary-500' : 
                                index === 2 ? 'bg-success-500' : 
                                index === 3 ? 'bg-warning-500' : 'bg-gray-400';
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${colorClass}`}></div>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {item.label}
                  </span>
                  <span className="text-gray-500 ml-auto">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;

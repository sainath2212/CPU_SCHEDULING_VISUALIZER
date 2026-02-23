import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart
} from 'recharts';

/**
 * Reusable time-series chart component.
 *
 * Props:
 *   data      - array of tick snapshot objects
 *   dataKey   - which field to plot (e.g. "cpuUtilization")
 *   title     - chart title
 *   color     - line/area color
 *   unit      - Y-axis unit suffix (e.g. "%")
 *   filled    - if true, render as area chart
 */
export default function TimeSeriesChart({
    data = [],
    dataKey,
    title,
    color = '#6366f1',
    unit = '',
    filled = false,
}) {
    if (data.length === 0) {
        return (
            <div className="ts-chart-card">
                <h3 className="ts-chart-title">{title}</h3>
                <div className="ts-chart-empty">Run a simulation to see data</div>
            </div>
        );
    }

    const ChartComponent = filled ? AreaChart : LineChart;
    const DataComponent = filled ? Area : Line;

    return (
        <div className="ts-chart-card">
            <h3 className="ts-chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={220}>
                <ChartComponent data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="tick"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        label={{ value: 'Time (ticks)', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        unit={unit}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(15, 15, 30, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 12,
                        }}
                        formatter={(value) => [`${value}${unit}`, title]}
                    />
                    <DataComponent
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        fill={filled ? `${color}33` : 'none'}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                    />
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
}

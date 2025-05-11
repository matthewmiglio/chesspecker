// Reusable chart config
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const ChartCard = ({ title, data, dataKey }: { title: string, data: any[], dataKey: string }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey={dataKey} stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default ChartCard;

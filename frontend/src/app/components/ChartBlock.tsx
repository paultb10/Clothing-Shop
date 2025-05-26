import { Pie, Bar } from 'react-chartjs-2';

type ChartType = 'pie' | 'bar';

interface ChartBlockProps {
    type: ChartType;
    data: any;
    height?: number;
}

export default function ChartBlock({ type, data, height = 200 }: ChartBlockProps) {
    const ChartComponent = type === 'pie' ? Pie : Bar;
    return (
        <div className="w-full max-w-md mx-auto">
            <ChartComponent data={data} options={{ responsive: true, maintainAspectRatio: false }} height={height} />
        </div>
    );
}

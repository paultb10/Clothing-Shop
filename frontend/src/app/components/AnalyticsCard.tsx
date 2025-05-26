interface Props {
    title: string;
    children: React.ReactNode;
}

export default function AnalyticsCard({ title, children }: Props) {
    return (
        <section className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            {children}
        </section>
    );
}

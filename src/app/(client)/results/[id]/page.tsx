import { ResultDetailScreen } from "@/features/results/components/result-detail-screen";

type ResultDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;

  return <ResultDetailScreen runId={id} />;
}

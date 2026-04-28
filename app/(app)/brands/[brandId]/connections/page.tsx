import { redirect } from "next/navigation";

export default async function ConnectionsPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  redirect(`/brands/${brandId}/settings`);
}

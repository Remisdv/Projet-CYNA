import { useActiveAdvertisement } from './hooks/useAdvertisement';

export default function AdvertisementBanner() {
  const { data } = useActiveAdvertisement();

  if (!data?.textFr) return null;

  return (
    <div className="bg-blue-600 py-3 text-center text-sm font-medium text-white">
      {data.textFr}
    </div>
  );
}

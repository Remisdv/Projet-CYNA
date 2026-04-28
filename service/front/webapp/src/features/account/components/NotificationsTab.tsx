import { Button } from '@/shared/components/ui/Button';

export function NotificationsTab() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Préférences de notifications</h2>
      <div className="space-y-4">
        {[
          { label: 'Alertes de sécurité', desc: 'Soyez informé des événements critiques détectés.', checked: true },
          { label: 'Rapports mensuels', desc: 'Recevez votre rapport de sécurité mensuel par email.', checked: true },
          { label: 'Actualités et offres', desc: 'Restez informé de nos nouvelles solutions et promotions.', checked: false },
          { label: 'Renouvellements', desc: 'Rappels avant le renouvellement de vos abonnements.', checked: true },
        ].map(item => (
          <label key={item.label} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              defaultChecked={item.checked}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <Button size="sm" className="mt-6">Enregistrer</Button>
    </div>
  );
}

import { Shield, Smartphone, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PasswordInput } from '@/shared/components/ui/PasswordInput';
import { useTwoFactor } from '../hooks/useTwoFactor';

export function TwoFactorSection() {
  const tf = useTwoFactor();
  const {
    view, setView,
    password, setPassword,
    code, setCode,
    totpData,
    emailEnableCodeSent,
    disableCodeSent, setDisableCodeSent,
    error, setError,
    success, setSuccess,
    loading,
    twoFactorEnabled,
    totpEnabled,
    reset,
    handleRequestEnableEmail,
    handleConfirmEnableEmail,
    handleSetupTotp,
    handleConfirmTotp,
    handleRequestDisableCode,
    handleDisable,
  } = tf;

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Shield size={18} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h2>
        {twoFactorEnabled && (
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {totpEnabled ? 'Activée (Application)' : 'Activée (Email)'}
          </span>
        )}
        {!twoFactorEnabled && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Désactivée
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      {view === 'main' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            La 2FA renforce la sécurité de votre compte en demandant un code supplémentaire lors de la connexion.
          </p>
          {!twoFactorEnabled && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="sm" onClick={() => { setError(''); setSuccess(''); setView('enable-email'); }}>
                <Mail size={14} className="mr-1.5" />
                Activer par email
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setError(''); setSuccess(''); setView('setup-totp'); }}>
                <Smartphone size={14} className="mr-1.5" />
                Activer par application (TOTP)
              </Button>
            </div>
          )}
          {twoFactorEnabled && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => { setError(''); setSuccess(''); setView('disable'); }}>
              Désactiver la 2FA
            </Button>
          )}
        </div>
      )}

      {view === 'enable-email' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre mot de passe pour recevoir un code de confirmation par email.
          </p>
          <PasswordInput
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          {!emailEnableCodeSent ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRequestEnableEmail} disabled={loading || !password}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-green-600">Un code a été envoyé à votre adresse email.</p>
              <Input label="Code reçu par email (6 chiffres)" value={code}
                onChange={onCodeChange} inputMode="numeric" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfirmEnableEmail} disabled={loading || code.length !== 6}>
                  {loading ? 'Activation...' : 'Activer la 2FA'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'setup-totp' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre mot de passe pour générer le QR code.
          </p>
          <PasswordInput
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSetupTotp} disabled={loading || !password}>
              {loading ? 'Génération...' : 'Continuer'}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
          </div>
        </div>
      )}

      {view === 'confirm-totp' && totpData && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scannez ce QR code avec votre application (Google Authenticator, Authy…), puis entrez votre mot de passe et le code généré.
          </p>
          <div className="flex justify-center">
            <img src={totpData.qrCodeDataUrl} alt="QR Code TOTP" className="h-40 w-40 rounded border border-gray-200" />
          </div>
          <p className="text-center text-xs text-gray-400">
            Ou entrez manuellement : <span className="font-mono text-gray-600">{totpData.secret}</span>
          </p>
          <PasswordInput
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <Input label="Code de l'application (6 chiffres)" value={code}
            onChange={onCodeChange} inputMode="numeric" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirmTotp} disabled={loading || code.length !== 6 || !password}>
              {loading ? 'Vérification...' : 'Confirmer'}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
          </div>
        </div>
      )}

      {view === 'disable' && (
        <div className="space-y-4">
          {totpEnabled ? (
            <>
              <p className="text-sm text-gray-600">
                Entrez votre mot de passe et le code de votre application pour désactiver la 2FA.
              </p>
              <PasswordInput label="Mot de passe" value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
              <Input label="Code de l'application (6 chiffres)" value={code}
                onChange={onCodeChange} inputMode="numeric" />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDisable}
                  disabled={loading || !password || code.length !== 6}>
                  {loading ? 'Désactivation...' : 'Désactiver'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          ) : !disableCodeSent ? (
            <>
              <p className="text-sm text-gray-600">
                Entrez votre mot de passe pour recevoir un code de confirmation par email.
              </p>
              <PasswordInput label="Mot de passe" value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRequestDisableCode}
                  disabled={loading || !password}>
                  {loading ? 'Envoi...' : 'Envoyer le code'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Un code de confirmation a été envoyé à votre adresse email. Entrez-le pour désactiver la 2FA.
              </p>
              <Input label="Code reçu par email (6 chiffres)" value={code}
                onChange={onCodeChange} inputMode="numeric" />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDisable}
                  disabled={loading || code.length !== 6}>
                  {loading ? 'Désactivation...' : 'Désactiver'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDisableCodeSent(false); setCode(''); setError(''); }}>Retour</Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

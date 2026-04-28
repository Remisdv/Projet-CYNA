import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/shared/lib/apiClient';
import { useAuth } from '@/shared/context/AuthContext';

const RESEND_COOLDOWN = 60;

export default function TwoFactorPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithTokens } = useAuth();
    const { userId, email, method } = (location.state as any) || {};

    useEffect(() => {
        if (!userId) navigate('/login');
    }, [userId, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    if (!userId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Le code doit contenir 6 chiffres');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const { data } = await apiClient.post('/webapp/auth/2fa/verify', { userId, code });
            if (data.access_token) localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            loginWithTokens(data.user);
            navigate('/account');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Code invalide');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || method === 'totp') return;
        try {
            setResendSuccess(false);
            await apiClient.post('/webapp/auth/2fa/resend', { userId });
            setResendSuccess(true);
            setResendCooldown(RESEND_COOLDOWN);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du renvoi');
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center py-12">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
                    Vérification en deux étapes
                </h1>
                <p className="mb-6 text-center text-sm text-gray-500">
                    {method === 'totp'
                        ? 'Entrez le code généré par votre application d\'authentification.'
                        : <>Un code a été envoyé à <span className="font-medium text-gray-700">{email}</span></>}
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}
                {resendSuccess && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                        Nouveau code envoyé !
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Code de vérification
                        </label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            inputMode="numeric"
                            className="block w-full rounded-lg border border-gray-300 p-3 text-center font-mono text-2xl tracking-[0.5em] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || code.length !== 6}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Vérification...' : 'Vérifier'}
                    </button>
                </form>

                {method !== 'totp' && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-sm text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                            {resendCooldown > 0
                                ? `Renvoyer le code (${resendCooldown}s)`
                                : 'Renvoyer le code'}
                        </button>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        ← Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    );
}

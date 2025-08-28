import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { googleLogin } from '../../api/userApi';

const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleGoogleLogin = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'profile email',
            callback: async (response) => {
                try {
                    const res = await googleLogin(response.access_token);

                    if (res.data.success) {
                        login({ user: res.data.data.user, token: res.data.data.token });
                        navigate('/');
                    } else {
                        console.error(res.data.message);
                    }
                } catch (err) {
                    console.error("Google login error", err);
                }
            },
        });

        client.requestAccessToken();
    };

    return (
        <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-4 py-3 rounded-lg shadow-lg cursor-pointer w-full transition-all duration-300 backdrop-blur-sm hover:shadow-xl"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;

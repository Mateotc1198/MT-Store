import { auth } from '../config/firebase-config';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// --- Handle Logout ---
export const logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Handle Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('login-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'CARGANDO...';
        }

        try {
            const email = e.target.email.value;
            const password = e.target.password.value;
            
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/?login=success';
        } catch (error) {
            console.error('Login Error:', error.code, error.message);
            alert('Error al iniciar sesión: ' + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Iniciar Sesión';
            }
        }
    });
}

// Handle Register Form
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('register-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'CREANDO CUENTA...';
        }

        try {
            const email = e.target.email.value;
            const password = e.target.password.value;
            const confirmPassword = e.target['confirm-password'].value;

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = '/?register=success';
        } catch (error) {
            console.error('Registration Error:', error.code, error.message);
            alert('Error al registrarse: ' + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Crear Cuenta';
            }
        }
    });
}

// Google Auth
const setupGoogleAuth = (btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', async () => {
            try {
                await signInWithPopup(auth, googleProvider);
                window.location.href = '/?login=success';
            } catch (error) {
                console.error('Google Auth Error:', error.code, error.message);
                alert('Error con Google: ' + error.message);
            }
        });
    }
};

setupGoogleAuth('google-login');
setupGoogleAuth('google-register');

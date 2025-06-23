import React from 'react';

interface LoginErrorHandlerProps {
  errorCode: string | null; // Usamos errorCode en vez de mensaje crudo
  onClose: () => void;
  technicalMessage?: string | null; // Opcional: para mostrar mensaje técnico si lo deseas
}

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Las credenciales ingresadas son incorrectas. Por favor, verifica tu correo y contraseña.',
  ACCOUNT_LOCKED: 'Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos. Contacta al administrador para desbloquearla.',
  USER_NOT_FOUND: 'El usuario no existe en nuestro sistema.',
  USER_DISABLED: 'Tu cuenta ha sido deshabilitada. Contacta al soporte para más información.',
  TOO_MANY_ATTEMPTS: 'Demasiados intentos fallidos. Intenta de nuevo más tarde.',
  SERVER_ERROR: 'Ha ocurrido un error interno. Por favor, intenta nuevamente más tarde.',
  UNKNOWN: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.'
};

const LoginErrorHandler: React.FC<LoginErrorHandlerProps> = ({ errorCode, onClose, technicalMessage }) => {
  if (!errorCode) return null;

  const friendlyMessage = errorMessages[errorCode] || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.';

  return (
    <div className="loginErrorHandler">
      <div className="errorContent">
        <p>{friendlyMessage}</p>
        {import.meta.env.NODE_ENV === 'development' && technicalMessage && (
          <pre className="errorTechnical">{technicalMessage}</pre>
        )}
        <button onClick={onClose} className="errorCloseButton">Cerrar</button>
      </div>
    </div>
  );
};

export default LoginErrorHandler;

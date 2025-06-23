import React from 'react';
import { usersService } from '../../services/usersService';

const UnlockUserButton: React.FC<{ userId: string }> = ({ userId }) => {
  const handleUnlock = async () => {
    try {
      await usersService.unlockUser(userId);
      alert('Usuario desbloqueado correctamente.');
    } catch (error) {
      console.error(error);
      alert('No se pudo desbloquear al usuario.');
    }
  };

  return (
    <button onClick={handleUnlock} className="btn btn-primary">
      Desbloquear Usuario
    </button>
  );
};

export default UnlockUserButton;

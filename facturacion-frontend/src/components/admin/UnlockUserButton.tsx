import React from 'react';
import { notifications, confirmAction } from '../../utils/notifications';
import { usersService } from '../../services/usersService';

const UnlockUserButton: React.FC<{ userId: string }> = ({ userId }) => {  const handleUnlock = async () => {
    // Confirmación antes de desbloquear
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas desbloquear este usuario?',
      'Confirmar Desbloqueo',
      'Sí, desbloquear',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await usersService.unlockUser(userId);
      notifications.success('Usuario desbloqueado correctamente.');
    } catch (error) {
      console.error(error);
      notifications.error('No se pudo desbloquear al usuario.');
    }
  };

  return (
    <button onClick={handleUnlock} className="btn btn-primary">
      Desbloquear Usuario
    </button>
  );
};

export default UnlockUserButton;



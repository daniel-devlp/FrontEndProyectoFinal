import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import DynamicButton from '../common/DynamicButton';
import Modal from '../common/Modal';

interface RoleSelectionModalProps {
  isOpen: boolean;
  roles: string[];
  onRoleSelect: (role: string) => void;
  onClose: () => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  roles,
  onRoleSelect,
  onClose
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleConfirmation = () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol');
      return;
    }
    
    authService.selectRole(selectedRole);
    onRoleSelect(selectedRole);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'Acceso completo al sistema: gestión de usuarios, roles, clientes, productos y facturas';
      case 'user':
        return 'Acceso a gestión de clientes, visualización de productos y creación/gestión de facturas';
      default:
        return `Acceso con rol ${role}`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div style={{ 
        width: '500px', 
        maxWidth: '90vw',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Seleccionar Rol de Acceso
          </h2>
          <p style={{ 
            color: '#7f8c8d', 
            marginBottom: '2rem',
            lineHeight: '1.5'
          }}>
            Tu cuenta tiene acceso a múltiples roles. Por favor selecciona con qué rol deseas acceder al sistema.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {roles.map((role) => (
            <div
              key={role}
              style={{
                border: selectedRole === role ? '2px solid #3498db' : '2px solid #ecf0f1',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                backgroundColor: selectedRole === role ? '#ebf3fd' : '#ffffff',
                transition: 'all 0.3s ease',
                boxShadow: selectedRole === role ? '0 4px 12px rgba(52, 152, 219, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => setSelectedRole(role)}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                  style={{ marginRight: '1rem' }}
                />
                <h3 style={{ 
                  margin: 0, 
                  color: '#2c3e50',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {getRoleDisplayName(role)}
                </h3>
              </div>
              <p style={{ 
                margin: 0, 
                color: '#7f8c8d',
                fontSize: '0.95rem',
                textAlign: 'left',
                lineHeight: '1.4'
              }}>
                {getRoleDescription(role)}
              </p>
            </div>
          ))}
        </div>        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
          <DynamicButton
            type="delete"
            onClick={() => {
              authService.logout();
              window.location.href = '/';
            }}
            label="Cancelar"
          />
          <DynamicButton
            type="save"
            onClick={handleRoleConfirmation}
            label="Continuar"
          />
        </div>
      </div>
    </Modal>
  );
};

export default RoleSelectionModal;

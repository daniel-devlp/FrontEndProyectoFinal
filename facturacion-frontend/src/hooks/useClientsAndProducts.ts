import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Client {
  id: number;
  name: string;
  lastName: string;
  phone: string;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

const useClientsAndProducts = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchClients = async (searchTerm: string, pageSize: number, pageNumber: number) => {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      searchTerm: searchTerm || '',
    });

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Ejemplo de token almacenado
    };

    const response = await fetch(`/api/clients?${queryParams}`, { headers });

    if (!response.ok) {
      console.error(`Error al obtener clientes: ${response.status} - ${response.statusText}`);
      throw new Error('Error al obtener clientes');
    }

    const clients = await response.json();
    console.log('Respuesta del endpoint de clientes:', clients);

    return clients.map((client: any) => ({
      id: client.identificationNumber,
      name: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
    }));
  };

  const fetchProducts = async (searchTerm: string, pageSize: number, pageNumber: number) => {
    const queryParams = new URLSearchParams({
      searchTerm,
      pageSize: pageSize.toString(),
      pageNumber: pageNumber.toString(),
    });
    const response = await fetch(`/api/products?${queryParams}`);
    return response.json();
  };

  useEffect(() => {
    const fetchClientsAndProducts = async () => {
      try {
        const clientsData = await fetchClients('', 10, 1);
        const productsData = await fetchProducts('', 10, 1);
        setClients(clientsData);
        setProducts(productsData);
      } catch (error) {
        toast.error('Error al cargar clientes o productos.');
      }
    };
    fetchClientsAndProducts();
  }, []);

  return { clients, products, fetchClients, fetchProducts };
};

export default useClientsAndProducts;

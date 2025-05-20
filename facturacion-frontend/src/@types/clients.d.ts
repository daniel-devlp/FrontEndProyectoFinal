interface Client {
  Identification: string;
  FirstName: string;
  LastName: string;
  Phone?: string | null;
  Email?: string | null;
  Address?: string | null;
}

interface ClientFormValues extends Omit<Client, 'Identification'> {
  Identification?: string; // Optional for edit forms
}

interface FullClient extends Client {
  Invoices?: Invoice[]; // For relationships
}

// Filters for clients
interface ClientFilters {
  search?: string;
  byIdentification?: string;
  byFirstName?: string;
  byEmail?: string;
  limit?: number;
}

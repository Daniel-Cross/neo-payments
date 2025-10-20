import { Contact } from '../components/RecipientSelection';

class ContactsService {
  private static instance: ContactsService;
  private contacts: Contact[] = [];
  private favorites: Contact[] = [];

  private constructor() {
    this.loadContacts();
  }

  public static getInstance(): ContactsService {
    if (!ContactsService.instance) {
      ContactsService.instance = new ContactsService();
    }
    return ContactsService.instance;
  }

  /**
   * Get all contacts
   */
  public getContacts(): Contact[] {
    return this.contacts;
  }

  /**
   * Get all favorites
   */
  public getFavorites(): Contact[] {
    return this.favorites;
  }

  /**
   * Add a new contact
   */
  public addContact(name: string, address: string): Contact {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      address,
      isFavorite: false,
    };

    this.contacts.push(newContact);
    this.saveContacts();
    return newContact;
  }

  /**
   * Toggle favorite status of a contact
   */
  public toggleFavorite(contact: Contact): Contact {
    const updatedContact = { ...contact, isFavorite: !contact.isFavorite };
    
    // Update in contacts array
    const contactIndex = this.contacts.findIndex(c => c.id === contact.id);
    if (contactIndex !== -1) {
      this.contacts[contactIndex] = updatedContact;
    }

    // Update favorites array
    if (updatedContact.isFavorite) {
      // Add to favorites if not already there
      const favoriteIndex = this.favorites.findIndex(f => f.id === contact.id);
      if (favoriteIndex === -1) {
        this.favorites.push(updatedContact);
      } else {
        this.favorites[favoriteIndex] = updatedContact;
      }
    } else {
      // Remove from favorites
      this.favorites = this.favorites.filter(f => f.id !== contact.id);
    }

    this.saveContacts();
    return updatedContact;
  }

  /**
   * Remove a contact
   */
  public removeContact(contactId: string): void {
    this.contacts = this.contacts.filter(c => c.id !== contactId);
    this.favorites = this.favorites.filter(f => f.id !== contactId);
    this.saveContacts();
  }

  /**
   * Find contact by address
   */
  public findContactByAddress(address: string): Contact | undefined {
    return this.contacts.find(c => c.address === address);
  }

  /**
   * Load contacts from storage (mock implementation)
   */
  private loadContacts(): void {
    // In a real app, this would load from secure storage
    // For now, we'll use some mock data
    this.contacts = [
      {
        id: '1',
        name: 'Alice Johnson',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        isFavorite: true,
      },
      {
        id: '2',
        name: 'Bob Smith',
        address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        isFavorite: false,
      },
      {
        id: '3',
        name: 'Charlie Brown',
        address: '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyCQdKjxX7es',
        isFavorite: true,
      },
    ];

    // Initialize favorites from contacts
    this.favorites = this.contacts.filter(c => c.isFavorite);
  }

  /**
   * Save contacts to storage (mock implementation)
   */
  private saveContacts(): void {
    // In a real app, this would save to secure storage
    console.log('Contacts saved:', this.contacts);
    console.log('Favorites saved:', this.favorites);
  }
}

// Export singleton instance
export const contactsService = ContactsService.getInstance();
export default contactsService;

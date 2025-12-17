import { User } from '../../../models/User';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = await User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.balance).toBe(0);
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
      expect(user.isVerified).toBe(false);
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user without required fields', async () => {
      const userData = {
        email: 'incomplete@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare passwords', async () => {
      const password = 'mySecurePassword123';
      const user = await User.create({
        email: 'password@example.com',
        password,
        firstName: 'Test',
        lastName: 'User',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword!.comparePassword(password);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'wrongpass@example.com',
        password: 'correctPassword',
        firstName: 'Test',
        lastName: 'User',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword!.comparePassword('wrongPassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const user = await User.create({
        email: 'UPPERCASE@EXAMPLE.COM',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.email).toBe('uppercase@example.com');
    });
  });
});

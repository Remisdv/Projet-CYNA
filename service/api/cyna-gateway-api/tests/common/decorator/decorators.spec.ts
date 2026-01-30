import { IS_PUBLIC_KEY, Public } from '../../../src/common/decorator/public.decorator';
import { ROLES_KEY, Roles } from '../../../src/common/decorator/roles.decorator';

describe('Decorators', () => {
  describe('Public decorator', () => {
    it('should set IS_PUBLIC_KEY metadata to true', () => {
      const decorator = Public();

      @decorator
      class TestClass {}

      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass);
      expect(metadata).toBe(true);
    });

    it('should work on methods', () => {
      class TestClass {
        @Public()
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toBe(true);
    });

    it('should export IS_PUBLIC_KEY constant', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('Roles decorator', () => {
    it('should set ROLES_KEY metadata with single role', () => {
      @Roles('admin')
      class TestClass {}

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass);
      expect(metadata).toEqual(['admin']);
    });

    it('should set ROLES_KEY metadata with multiple roles', () => {
      @Roles('admin', 'commercial')
      class TestClass {}

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass);
      expect(metadata).toEqual(['admin', 'commercial']);
    });

    it('should work on methods', () => {
      class TestClass {
        @Roles('admin')
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual(['admin']);
    });

    it('should export ROLES_KEY constant', () => {
      expect(ROLES_KEY).toBe('roles');
    });

    it('should handle empty roles', () => {
      @Roles()
      class TestClass {}

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass);
      expect(metadata).toEqual([]);
    });
  });
});
